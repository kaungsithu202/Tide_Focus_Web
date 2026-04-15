import IfElse from "@/components/common/IfElse";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Waves } from "lucide-react";
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

        <div className="p-6 pt-4 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-xs font-medium text-muted-foreground">
                Your waves
              </span>
              <span className="text-[11px] text-muted-foreground/60">
                Click a wave to edit it
              </span>
            </div>
            <div className="max-h-[200px] overflow-y-auto rounded-lg border">
              <IfElse
                isTrue={!!categories?.length}
                ifBlock={
                  <div className="p-1.5">
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
          </div>

          <div className="h-px bg-border" />

          <div className="space-y-4">
            <IfElse
              isTrue={mode === "editWave" && !!selectedCategory}
              ifBlock={
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Editing{" "}
                    <span className="text-foreground">
                      {selectedCategory?.name}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory(null);
                      setMode("addWave");
                    }}
                    className="inline-flex items-center gap-1 text-xs font-medium text-ocean-700 hover:text-ocean-800 transition-colors"
                  >
                    <Plus size={10} />
                    New wave
                  </button>
                </div>
              }
              elseBlock={
                <span className="text-xs font-medium text-muted-foreground">
                  Create a wave
                </span>
              }
            />

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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDialog;
