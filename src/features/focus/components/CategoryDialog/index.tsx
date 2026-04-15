import IfElse from "@/components/common/IfElse";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Waves } from "lucide-react";
import { useState, type Dispatch, type SetStateAction } from "react";
import type { Category } from "../../types";
import Wave from "../Wave";
import WaveForm from "../WaveForm";

interface Props {
  categories: Category[] | undefined;
  openCategoryDialog: boolean;
  setOpenCategoryDialog: Dispatch<SetStateAction<boolean>>;
}

const CategoryDialog = ({
  categories,
  openCategoryDialog,
  setOpenCategoryDialog,
}: Props) => {
  const [mode, setMode] = useState<"addWave" | "editWave">("addWave");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  return (
    <Dialog open={openCategoryDialog} onOpenChange={setOpenCategoryDialog}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Waves size={15} className="text-ocean-700" />
            Manage Waves
          </DialogTitle>
          <DialogDescription className="text-xs">
            Organize focus sessions by topic or project.
          </DialogDescription>
        </DialogHeader>

        <div className="p-5 pt-3 space-y-4">
          <div className="max-h-[160px] overflow-y-auto rounded-md border">
            <IfElse
              isTrue={!!categories?.length}
              ifBlock={
                <div className="p-1">
                  {categories?.map((category) => (
                    <Wave
                      key={category.id}
                      onSetMode={setMode}
                      onSelectCategory={(cat) => {
                        setSelectedCategory(cat);
                        setMode("editWave");
                      }}
                      category={category}
                      isSelected={selectedCategory?.id === category.id}
                    />
                  ))}
                </div>
              }
              elseBlock={
                <div className="flex items-center justify-center h-16 text-xs text-muted-foreground">
                  No waves yet. Create one below.
                </div>
              }
            />
          </div>

          <div className="h-px bg-border" />

          <WaveForm
            selectedCategory={selectedCategory}
            mode={mode}
            onSelectCategory={setSelectedCategory}
            onSwitchToAdd={() => {
              setSelectedCategory(null);
              setMode("addWave");
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDialog;
