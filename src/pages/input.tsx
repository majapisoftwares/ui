import { getCookies } from "cookies-next";
import type { GetServerSideProps } from "next";
import { NextSeo } from "next-seo";
import Breadcrumbs from "../../lib/components/Breadcrumbs";
import Input from "../../lib/components/Input";
import Stack from "../../lib/components/Stack";
import getPublicLayout from "../views/publicLayout";
import NumericInput from "../../lib/components/Input/NumericInput";
import PatternInput from "../../lib/components/Input/PatternInput";
import { useState } from "react";
import MultiSelectInput from "../../lib/components/Input/MultiSelectInput";
import SelectInput from "../../lib/components/Input/SelectInput";
import { Icon } from "@iconify/react";
import { z } from "zod";
import { useForm } from "../../lib/form2";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => ({
  props: {
    cookies: await getCookies({ req, res }),
  },
});

const pages = [{ title: "Input" }];

const formSchema = z.object({
  multiSelected: z.array(z.string()).optional(),
});

export default function Page() {
  const [document, setDocument] = useState("");
  const [selected, setSelected] = useState<string>();

  const form = useForm({
    schema: formSchema,
  });

  return (
    <>
      <NextSeo title={pages[0]?.title} />
      <Breadcrumbs pages={pages} className="mb-2 md:mx-2" />
      <Stack className="p-2">
        <Input label="Username" helpText="Fill with your username" />
        <Input
          label="Username with error"
          error
          helpText="This field is required"
        />
        <Input label="Disabled field" disabled />
        <Input label="Select" select readOnly>
          <>
            {["a", "b"].map((a) => (
              <option key={a}>{a}</option>
            ))}
            <option>1</option>
            <option>2</option>
            <option>3</option>
          </>
        </Input>
        <Input label="Leading" leading="Qty" />
        <Input
          label="Leading and trailing"
          leading="$"
          trailing="USD"
          leadingInputClassName="pl-7"
        />
        <Input label="Loading input" loading placeholder="He's pulsating" />
        <NumericInput
          label="Currency input"
          prefix="R$"
          decimalSeparator=","
          thousandSeparator="."
          value={18.5}
          onValueChange={console.info}
        />
        <PatternInput
          label="CPF/CNPJ"
          format={
            document.length <= 11 ? "###.###.###-###" : "##.###.###/####-##"
          }
          mask={"___________ __".split("")}
          onValueChange={(val) => setDocument(val.value)}
          value={document}
        />
        <MultiSelectInput
          label="Mulsi select"
          options={[
            { name: "Option 1", value: "1" },
            { name: "Option 2", value: "2" },
            { name: "Option 3", value: "3" },
          ]}
          {...form.register("multiSelected")}
          badgeClassName="rounded-md"
        />
        <div className="flex gap-2">
          <SelectInput
            label="Select"
            options={[
              {
                name: (
                  <div className="flex items-center gap-2">
                    <Icon icon="proicons:openai" className="size-4" />
                    <span>ChatGPT</span>
                  </div>
                ),
                value: "gpt",
              },
              { name: "Option 1", value: "1" },
              { name: "Option 2", value: "2" },
              { name: "Option 3", value: "3" },
            ]}
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
            placeholder="Select an option"
          />
          <SelectInput
            label="Select 2"
            options={[
              {
                name: (
                  <div className="flex items-center gap-2">
                    <Icon icon="proicons:openai" className="size-4" />
                    <span>ChatGPT</span>
                  </div>
                ),
                value: "gpt",
              },
              { name: "Option 1", value: "1" },
              { name: "Option 2", value: "2" },
              { name: "Option 3", value: "3" },
            ]}
            placeholder="Select an option"
          />
        </div>
      </Stack>
    </>
  );
}

Page.getLayout = getPublicLayout;
