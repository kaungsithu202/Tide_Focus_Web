import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetUser } from "@/features/settings/queries";

export const Route = createFileRoute("/_pathlessLayout/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: user } = useGetUser();
  console.log("user", user);
  return (
    <div className="container-md">
      <h1 className="font-bold text-xl my-3">Account Settings</h1>
      <Card className="mt-10">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 grid-cols-[200px_200px]">
          <p className="font-semibold">USER</p>
          <p className="col-span-1">{user?.name}</p>
          <p className="font-semibold">EMAIL</p>
          <p>{user?.email}</p>
          {/* <div className="flex items-center gap-20"></div>
          <div className="flex items-center gap-20"></div> */}
        </CardContent>
      </Card>
    </div>
  );
}
