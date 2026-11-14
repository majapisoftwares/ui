"use client";

import { Fragment } from "react";
import { ChevronDownIcon } from "lucide-react";
import { useUiMessages } from "../lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { InputGroupButton } from "../components/ui/input-group";

export interface ModelOption {
  id: string;
  name: string;
}

export interface ModelProvider {
  name: string;
  models: ModelOption[];
}

export interface ModelSelectorProps {
  providers: ModelProvider[];
  /** The selected model's id. */
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * Picks the model for the next message (shadcn AI Elements Model Selector),
 * grouped by provider. Put it in the prompt input's `actions`.
 */
export function ModelSelector({
  providers,
  value,
  onValueChange,
  disabled,
}: ModelSelectorProps) {
  const messages = useUiMessages();
  const current =
    providers
      .flatMap((provider) => provider.models)
      .find((m) => m.id === value) ?? providers[0]?.models[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        render={
          <InputGroupButton
            size="sm"
            variant="outline"
            className="h-11 rounded-full md:h-8"
            aria-label={
              current ? messages.modelIs(current.name) : messages.model
            }
          />
        }
      >
        {current?.name ?? messages.model}
        <ChevronDownIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(next) => onValueChange(String(next))}
        >
          {providers.map((provider, index) => (
            <Fragment key={provider.name}>
              {index > 0 ? <DropdownMenuSeparator /> : null}
              <DropdownMenuGroup>
                <DropdownMenuLabel>{provider.name}</DropdownMenuLabel>
                {provider.models.map((model) => (
                  <DropdownMenuRadioItem
                    key={model.id}
                    value={model.id}
                    closeOnClick
                  >
                    {model.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuGroup>
            </Fragment>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export interface EffortSelectorProps {
  efforts: ModelOption[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

/** Picks how hard the model thinks (the Model Selector's effort menu). */
export function EffortSelector({
  efforts,
  value,
  onValueChange,
  disabled,
}: EffortSelectorProps) {
  const messages = useUiMessages();
  const current = efforts.find((effort) => effort.id === value) ?? efforts[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        render={
          <InputGroupButton
            size="sm"
            variant="outline"
            className="h-11 rounded-full md:h-8"
            aria-label={
              current ? messages.effortIs(current.name) : messages.effort
            }
          />
        }
      >
        <span className="text-muted-foreground">{messages.effort}</span>
        {current?.name}
        <ChevronDownIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{messages.effort}</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={value}
            onValueChange={(next) => onValueChange(String(next))}
          >
            {efforts.map((effort) => (
              <DropdownMenuRadioItem
                key={effort.id}
                value={effort.id}
                closeOnClick
              >
                {effort.name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
