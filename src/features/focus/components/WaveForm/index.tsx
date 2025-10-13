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
import Circle from "@uiw/react-color-circle";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateCategory } from "../../queries";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { categoryKeys } from "../../queries/query-keys";
import useUnsavedChangesWarning from "@/hooks/useUnsavedWarn";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "wave must be at least 2 characters.",
  }),
  color: z.string().min(2, {
    message: "select color",
  }),
});

const WaveForm = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: createCategoryAsync } = useCreateCategory();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      color: "#000",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    toast.promise(
      createCategoryAsync(values, {
        onSuccess: () => {
          form.reset();
          queryClient.invalidateQueries({ queryKey: [categoryKeys.all] });
        },
      }),
      {
        loading: "Loading...",
        success: "Success",
        error: "Error",
      }
    );
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-3">
        <div></div>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-normal">
                Add New Wave
              </FormLabel>
              <FormControl className="mt-1">
                <Input placeholder="Wave name" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem className="mt-3">
              <FormLabel className="text-xs font-normal">
                Select Color
              </FormLabel>

              <FormControl className="mt-1">
                <Circle
                  colors={[
                    "#A47864",
                    "#C67FAE",
                    "#D7E8BC",
                    "#98DDDF",
                    "#A6BE47",
                    "#2E5283",
                    "#6F8D6A",
                    "#E3BD33",
                    "#E2552D",
                    "#343148",
                    "#583432",
                    "#4C5578",
                    "#5DC7B7",
                    "#FFCA5C",
                    "#F0686C",
                    "#EDEAB1",
                    "#512C3A",
                    "#FF654F",
                    "#717388",
                    "#82643E",
                    "#e76f51",
                  ]}
                  color={field.value}
                  onChange={(color) => {
                    field.onChange(color.hex);
                    // setHex(color.hex);
                  }}
                />
                {/* <Input placeholder="Wave name" {...field} /> */}
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full mt-5">
          Submit
        </Button>
      </form>
    </Form>
  );
};

export default WaveForm;
