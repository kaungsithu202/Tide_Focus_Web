import { Pencil, Trash2 } from "lucide-react";
import { useDeleteCategory } from "../../queries";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { categoryKeys } from "../../queries/query-keys";
import type { Category } from "../../types";
import type { Dispatch, SetStateAction } from "react";

interface Props {
  category: Category;
  isSelected?: boolean;
  onSetMode: Dispatch<SetStateAction<"addWave" | "editWave">>;
  onSelectCategory: Dispatch<SetStateAction<Category | null>>;
}

const Wave = ({ category, isSelected, onSelectCategory, onSetMode }: Props) => {
  const queryClient = useQueryClient();

  const { mutateAsync: deleteCategoryAsync } = useDeleteCategory();

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    toast.promise(
      deleteCategoryAsync(id, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [categoryKeys.all] });
        },
      }),
      {
        loading: "Loading...",
        success: "Success",
        error: "Error",
      }
    );
  };

  return (
    <div
      onClick={() => onSelectCategory(category)}
      className={`flex items-center gap-3 w-full px-3 py-2 rounded-md cursor-pointer transition-colors duration-150 group ${
        isSelected
          ? "bg-ocean-700/10 ring-1 ring-ocean-700/20"
          : "hover:bg-muted"
      }`}
    >
      <div
        className="size-3 rounded-full shrink-0"
        style={{ backgroundColor: category.color }}
      />
      <span className="text-sm flex-1 truncate">{category.name}</span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSetMode("editWave");
            onSelectCategory(category);
          }}
          className="size-6 flex items-center justify-center rounded-md hover:bg-ocean-100 text-muted-foreground hover:text-ocean-700 transition-colors"
        >
          <Pencil size={12} />
        </button>
        <button
          onClick={(e) => handleDelete(e, category.id)}
          className="size-6 flex items-center justify-center rounded-md hover:bg-red-100 text-muted-foreground hover:text-red-600 transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};

export default Wave;
