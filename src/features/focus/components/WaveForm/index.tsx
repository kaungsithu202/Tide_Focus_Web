import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateCategory, useUpdateCategory } from "../../queries";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { categoryKeys } from "../../queries/query-keys";
import type { Category } from "../../types";
import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import { Check, Palette } from "lucide-react";

const PRESET_COLORS = [
  "#02367b",
  "#0078d4",
  "#0496c7",
  "#04bade",
  "#2E5283",
  "#6F8D6A",
  "#A6BE47",
  "#E3BD33",
  "#FFCA5C",
  "#e76f51",
  "#E2552D",
  "#F0686C",
  "#C67FAE",
  "#512C3A",
  "#343148",
  "#717388",
];

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Wave must be at least 2 characters.",
  }),
  color: z.string().min(2, {
    message: "Select a color.",
  }),
});

interface Props {
  selectedCategory: Category | null;
  mode: "addWave" | "editWave";
  onSelectCategory: Dispatch<SetStateAction<Category | null>>;
  onSwitchToAdd: () => void;
}

const WaveForm = ({
  selectedCategory,
  mode,
  onSelectCategory,
  onSwitchToAdd,
}: Props) => {
  const queryClient = useQueryClient();
  const nativeInputRef = useRef<HTMLInputElement>(null);

  const { mutateAsync: createCategoryAsync } = useCreateCategory();
  const { mutateAsync: updateCategoryAsync } = useUpdateCategory();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: selectedCategory
      ? {
          name: selectedCategory.name,
          color: selectedCategory.color,
        }
      : { name: "", color: PRESET_COLORS[0] },
  });

  const currentColor = form.watch("color");

  useEffect(() => {
    if (mode === "addWave") {
      onSelectCategory(null);
      form.reset({ name: "", color: PRESET_COLORS[0] });
    }
  }, [form, mode, onSelectCategory]);

  useEffect(() => {
    if (selectedCategory) {
      form.reset({
        name: selectedCategory.name,
        color: selectedCategory.color,
      });
    }
  }, [selectedCategory, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const mutation =
      mode === "editWave" && selectedCategory
        ? updateCategoryAsync(
            { id: selectedCategory.id, ...values },
            {
              onSuccess: () => {
                form.reset({ name: "", color: PRESET_COLORS[0] });
                onSwitchToAdd();
                queryClient.invalidateQueries({ queryKey: [categoryKeys.all] });
              },
            }
          )
        : createCategoryAsync(values, {
            onSuccess: () => {
              form.reset({ name: "", color: PRESET_COLORS[0] });
              queryClient.invalidateQueries({ queryKey: [categoryKeys.all] });
            },
          });

    toast.promise(mutation, {
      loading:
        mode === "editWave"
          ? `Saving "${selectedCategory?.name}"...`
          : "Creating wave...",
      success: (res: { name?: string } | undefined) => {
        const name = res?.name ?? values.name;
        return mode === "editWave"
          ? `"${name}" updated`
          : `"${name}" created`;
      },
      error: (err: unknown) => {
        const msg =
          err instanceof Error ? err.message : "Something went wrong";
        return mode === "editWave"
          ? `Failed to update wave — ${msg}`
          : `Failed to create wave — ${msg}`;
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium">Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Deep Work, Meetings"
                  {...field}
                  className="h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium">Color</FormLabel>
              <FormControl>
                <div>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => field.onChange(color)}
                        className={`size-6 rounded transition-all duration-100 flex items-center justify-center ${
                          field.value === color
                            ? "ring-2 ring-offset-2 ring-offset-background scale-110"
                            : "hover:scale-105"
                        }`}
                        style={{
                          backgroundColor: color,
                          boxShadow:
                            field.value === color
                              ? `0 0 0 2px var(--background), 0 0 0 4px ${color}`
                              : undefined,
                        }}
                      >
                        {field.value === color && (
                          <Check size={10} className="text-white" />
                        )}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => nativeInputRef.current?.click()}
                      className="size-6 rounded border border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-ocean-400 hover:text-ocean-600 transition-colors"
                    >
                      <Palette size={10} />
                    </button>
                    <input
                      ref={nativeInputRef}
                      type="color"
                      value={currentColor}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="sr-only"
                      tabIndex={-1}
                    />
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col items-center gap-2">
          <Button type="submit" variant="ocean" className="w-full h-9">
            {mode === "editWave" ? "Save changes" : "Create wave"}
          </Button>
          {mode === "editWave" && (
            <button
              type="button"
              onClick={onSwitchToAdd}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel editing
            </button>
          )}
        </div>
      </form>
    </Form>
  );
};

export default WaveForm;
