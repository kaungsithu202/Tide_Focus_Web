import { X } from "lucide-react";
import { useDeleteCategory } from "../../queries";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { categoryKeys } from "../../queries/query-keys";
import type { Category } from "../../types";
import type { Dispatch, SetStateAction } from "react";

interface Props {
  category: Category;
  onSetMode: Dispatch<SetStateAction<string>>;
  onSelectCategory: Dispatch<SetStateAction<Category | null>>;
}

const Wave = ({ category, onSelectCategory, onSetMode }: Props) => {
  const queryClient = useQueryClient();

  const { mutateAsync: deleteCategoryAsync } = useDeleteCategory();

  const handleDelete = (id: number) => {
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
    <button
      onClick={() => {
        onSetMode("editWave");
        onSelectCategory(category);
      }}
      className="flex items-center gap-3 w-full p-1 hover:bg-gray-100 rounded-md  transition-colors duration-200"
    >
      <div className="flex items-center gap-3 p-1.5 border border-gray-300 rounded-md text-[10px] w-full">
        <div
          className="size-2.5 rounded-full"
          style={{ backgroundColor: category.color }}
        />
        <span>{category.name}</span>
      </div>
      <div
        onClick={() => {
          handleDelete(category.id);
        }}
        className=" hover:bg-red-100 hover:text-red-500 p-1.5 rounded-xl transition-colors duration-200"
      >
        <X size={14} />
      </div>
    </button>
  );
};

export default Wave;
