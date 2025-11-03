import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  className?: string;
}

const IconBg = ({ children, className }: Props) => {
  return (
    <div
      className={cn(
        "bg-gray-50 p-1.5 rounded-full flex items-center justify-center",
        className
      )}
    >
      {children}
    </div>
  );
};

export default IconBg;
