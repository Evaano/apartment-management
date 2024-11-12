import { Button, Image } from "@mantine/core";
import { Link } from "@remix-run/react";

import errorImage from "~/assets/error.png";

export function ErrorButton() {
  return (
    <div className="mt-8 flex flex-col items-center">
      <div>
        <Image radius="md" h={400} w="auto" fit="contain" src={errorImage} />
      </div>
      <div className="mt-4">
        <Button component={Link} to={"/inventory"}>
          Go Back to the Home page
        </Button>
      </div>
    </div>
  );
}
