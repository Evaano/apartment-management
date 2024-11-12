import {
  Text,
  Title,
  SimpleGrid,
  TextInput,
  Textarea,
  Button,
  Group,
  Flex,
  useMantineTheme,
  useMantineColorScheme,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { z } from "zod";

import { ContactIconsList } from "~/components/contact/contact-icons";
import classes from "~/components/contact/contact.module.css";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  name: z.string().min(1),
  message: z.string().min(1),
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const { ...form } = Object.fromEntries(formData);

  const validatedForm = formSchema.safeParse(form);

  if (!validatedForm.success) {
    return json(
      { errors: validatedForm.error.formErrors.fieldErrors },
      { status: 400 },
    );
  }

  const response = await fetch("https://getform.io/f/anlekkya", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(validatedForm.data).toString(),
  });

  if (!response.ok) {
    console.error("Error posting to GetForm:", response.statusText);
  }

  return json({ errors: null }, { status: 200 });
};

export default function ContactUs() {
  const actionData = useActionData<typeof action>();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (actionData?.errors === null) {
      notifications.show({
        title: "Default notification",
        message: "Hey there, your code is awesome! 🤥",
        autoClose: 3000,
      });
      formRef.current?.reset();
    }
  }, [actionData]);

  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

  const getLabelColor = () => {
    return colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.white;
  };

  return (
    <Flex
      mih={50}
      gap="md"
      justify="center"
      align="center"
      direction="row"
      wrap="wrap"
    >
      <Form method={"post"} ref={formRef}>
        <div className={classes.wrapper}>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={50}>
            <div>
              <Title className={classes.title}>Contact Us</Title>
              <Text className={classes.description} mt="sm" mb={30}>
                Leave your email and we will get back to you within 24 hours
              </Text>

              <ContactIconsList />
            </div>
            <div className={classes.form}>
              <TextInput
                label="Email"
                placeholder="your@email.com"
                required
                classNames={{ input: classes.input, label: classes.inputLabel }}
                name={"email"}
                error={actionData?.errors?.email}
              />
              <TextInput
                label="Name"
                placeholder="Catppuccin"
                mt="md"
                classNames={{ input: classes.input, label: classes.inputLabel }}
                name={"name"}
                error={actionData?.errors?.name}
              />
              <Textarea
                required
                label="Your message"
                placeholder="I wanna speak to your manager! 😾"
                minRows={4}
                mt="md"
                classNames={{ input: classes.input, label: classes.inputLabel }}
                name={"message"}
                error={actionData?.errors?.message}
              />

              <Group justify="flex-end" mt="md">
                <Button
                  type={"submit"}
                  variant={"filled"}
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-expect-error
                  styles={() => ({
                    label: {
                      color: getLabelColor(),
                    },
                  })}
                >
                  Send message
                </Button>
              </Group>
            </div>
          </SimpleGrid>
        </div>
      </Form>
    </Flex>
  );
}
