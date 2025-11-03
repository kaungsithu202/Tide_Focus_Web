import IfElse from "@/components/common/IfElse";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [mode, setMode] = useState("addWave");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  console.log("selectedCategory", selectedCategory);

  return (
    <Dialog open={openCategoryDialog} onOpenChange={setOpenCategoryDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Waves size={18} />
            Manage Waves
          </DialogTitle>
          <DialogDescription className="my-2 text-sm">
            Waves help you organize focus sessions by topic or project and track
            time by each wave in Analytics.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3">
          <div className="w-[60%] text-xs bg-gray-50 p-2 rounded-md h-80">
            <h2 className="font-medium mb-3">Current Waves</h2>
            <IfElse
              isTrue={!!categories?.length}
              ifBlock={
                <div className="grid gap-1">
                  {categories?.map((category) => (
                    <Wave
                      key={category.id}
                      onSetMode={setMode}
                      onSelectCategory={setSelectedCategory}
                      category={category}
                    />
                  ))}
                </div>
              }
              elseBlock={
                <div className="flex items-center justify-center py-10 px-3 border border-dotted rounded-lg bg-white text-gray-400">
                  <p>No waves yet.</p>
                </div>
              }
            />
          </div>
          <div className="w-full">
            <Tabs value={mode} onValueChange={setMode} defaultValue="addWave">
              <TabsList>
                <TabsTrigger value="addWave" className="text-xs">
                  Add Wave
                </TabsTrigger>
                <TabsTrigger value="editWave" className="text-xs">
                  Edit Wave
                </TabsTrigger>
              </TabsList>
              <TabsContent value="addWave">
                <WaveForm
                  selectedCategory={selectedCategory}
                  mode={mode}
                  onSelectCategory={setSelectedCategory}
                />
              </TabsContent>
              <TabsContent value="editWave">
                <WaveForm
                  selectedCategory={selectedCategory}
                  mode={mode}
                  onSelectCategory={setSelectedCategory}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDialog;
