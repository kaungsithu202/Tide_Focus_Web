import { X } from "lucide-react";
import { useDeleteCategory } from "../../queries";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { categoryKeys } from "../../queries/query-keys";

interface Props {
  name: string;
  color: string;
  id: number;
}

const Wave = ({ name, color, id }: Props) => {
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
    <div className="flex items-center gap-3 w-full p-1 hover:bg-gray-100 rounded-md  transition-colors duration-200">
      <div className="flex items-center gap-3 p-1.5 border border-gray-300 rounded-md text-[10px] w-full">
        <div
          className="size-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span>{name}</span>
      </div>
      <button
        onClick={() => handleDelete(id)}
        className=" hover:bg-red-100 hover:text-red-500 p-1.5 rounded-xl transition-colors duration-200"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default Wave;
