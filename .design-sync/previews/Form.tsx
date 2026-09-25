import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
} from "vendra-storefront-florist";

type Values = { firstName: string; email: string; cardMessage: string };

function ContactForm({ showErrors = false }: { showErrors?: boolean }) {
  const form = useForm<Values>({
    defaultValues: {
      firstName: showErrors ? "" : "Sara",
      email: showErrors ? "sara@" : "sara@example.com",
      cardMessage: "",
    },
  });

  useEffect(() => {
    if (!showErrors) return;
    form.setError("firstName", { message: "Enter your first name." });
    form.setError("email", { message: "Enter a valid email address." });
  }, [form, showErrors]);

  return (
    <Form {...form}>
      <form className="flex w-96 flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormDescription>We'll send your order confirmation here.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cardMessage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Card message</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Optional — we'll hand-write it." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="lg">
          Continue
        </Button>
      </form>
    </Form>
  );
}

export const Checkout = () => <ContactForm />;
export const WithErrors = () => <ContactForm showErrors />;
