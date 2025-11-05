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
    <div className="container md:container-md">
      <h1 className="font-bold text-xl my-3">Account Settings</h1>
      <Card className="mt-3 md:mt-10">
        <CardHeader>
          <CardTitle>PROFILE</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:gap-5 md:grid-cols-[200px_200px] -mt-3 md:mt-0">
          <p className="font-normal">USER</p>
          <p className="col-span-1 text-gray-500">{user?.name}</p>
          <p className="font-normal">EMAIL</p>
          <p className="text-gray-500">{user?.email}</p>
        </CardContent>
      </Card>
    </div>
  );
}
