"use client";

import { useState, type ReactNode } from "react";
import {
  BellIcon,
  BoldIcon,
  ItalicIcon,
  MailIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  UnderlineIcon,
} from "lucide-react";
import { StatusBadge } from "@majapisoftwares/ui/patterns/status-badge";
import { Button } from "@majapisoftwares/ui/components/button";
import { ButtonGroup } from "@majapisoftwares/ui/components/button-group";
import { Badge } from "@majapisoftwares/ui/components/badge";
import { Input } from "@majapisoftwares/ui/components/input";
import { Textarea } from "@majapisoftwares/ui/components/textarea";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@majapisoftwares/ui/components/input-group";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@majapisoftwares/ui/components/field";
import { Label } from "@majapisoftwares/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@majapisoftwares/ui/components/select";
import { Checkbox } from "@majapisoftwares/ui/components/checkbox";
import {
  RadioGroup,
  RadioGroupItem,
} from "@majapisoftwares/ui/components/radio-group";
import { Switch } from "@majapisoftwares/ui/components/switch";
import { Slider } from "@majapisoftwares/ui/components/slider";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@majapisoftwares/ui/components/toggle-group";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@majapisoftwares/ui/components/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@majapisoftwares/ui/components/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@majapisoftwares/ui/components/popover";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@majapisoftwares/ui/components/hover-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@majapisoftwares/ui/components/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@majapisoftwares/ui/components/tooltip";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@majapisoftwares/ui/components/alert";
import { Progress } from "@majapisoftwares/ui/components/progress";
import { Spinner } from "@majapisoftwares/ui/components/spinner";
import {
  HELIX_VARIANTS,
  LATTICE_VARIANTS,
  LENS_VARIANTS,
  MORPH_VARIANTS,
  ORB_TASK_LABELS,
  Orb,
  RING_VARIANTS,
} from "@majapisoftwares/ui/components/orb";
import { Skeleton } from "@majapisoftwares/ui/components/skeleton";
import { toast } from "@majapisoftwares/ui/components/sonner";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
} from "@majapisoftwares/ui/components/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@majapisoftwares/ui/components/accordion";
import { Kbd, KbdGroup } from "@majapisoftwares/ui/components/kbd";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@majapisoftwares/ui/components/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@majapisoftwares/ui/components/card";
import { defineMessages, useMessages } from "@majapisoftwares/ui/lib/i18n";

const messages = defineMessages({
  en: {
    buttons: "Buttons",
    badges: "Badges",
    inputs: "Inputs",
    selection: "Selection",
    overlays: "Overlays",
    feedback: "Feedback",
    display: "Display",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    saving: "Saving",
    add: "Add",
    running: "Running",
    partial: "Partial",
    failed: "Failed",
    unknown: "Unknown",
    readOnly: "Read-only",
    new: "New",
    email: "Email",
    emailHint: "We'll never share it.",
    search: "Search",
    notes: "Notes",
    invalid: "Invalid",
    disabled: "Disabled",
    region: "Region",
    notifications: "Email notifications",
    terms: "Accept terms",
    plan: "Plan",
    free: "Free",
    pro: "Pro",
    volume: "Volume",
    openDialog: "Open dialog",
    editProfile: "Edit profile",
    editProfileBody: "Changes apply right away.",
    deleteProject: "Delete project?",
    deleteProjectBody: "This can't be undone.",
    popover: "Popover",
    popoverBody: "Extra details in context.",
    hoverMe: "Hover me",
    menu: "Menu",
    tooltip: "Tooltip",
    tooltipBody: "Helpful hint",
    showToast: "Show toast",
    toastSaved: "Changes saved",
    toastError: "Couldn't save",
    errorToast: "Error toast",
    upload: "Uploading",
    alertTitle: "Heads up",
    alertBody: "New version available.",
    faq1: "Is it accessible?",
    faq1Body: "Yes. Keyboard and screen reader friendly.",
    faq2: "Can I theme it?",
    faq2Body: "Through tokens in the shared library.",
    shortcut: "Command palette",
    account: "Account",
    security: "Security",
    accountBody: "Name, email and avatar.",
    securityBody: "Password and sessions.",
    loadingTitle: "Loading",
    thinking: "Thinking…",
    underline: "Underline",
    italic: "Italic",
    bold: "Bold",
  },
  "pt-BR": {
    buttons: "Botões",
    badges: "Badges",
    inputs: "Campos",
    selection: "Seleção",
    overlays: "Sobreposições",
    feedback: "Feedback",
    display: "Exibição",
    save: "Salvar",
    cancel: "Cancelar",
    delete: "Excluir",
    saving: "Salvando",
    add: "Adicionar",
    running: "Em execução",
    partial: "Parcial",
    failed: "Falhou",
    unknown: "Desconhecido",
    readOnly: "Somente leitura",
    new: "Novo",
    email: "E-mail",
    emailHint: "Nunca será compartilhado.",
    search: "Buscar",
    notes: "Observações",
    invalid: "Inválido",
    disabled: "Desativado",
    region: "Região",
    notifications: "Notificações por e-mail",
    terms: "Aceitar termos",
    plan: "Plano",
    free: "Grátis",
    pro: "Pro",
    volume: "Volume",
    openDialog: "Abrir diálogo",
    editProfile: "Editar perfil",
    editProfileBody: "As alterações valem na hora.",
    deleteProject: "Excluir projeto?",
    deleteProjectBody: "Isso não pode ser desfeito.",
    popover: "Popover",
    popoverBody: "Detalhes extras no contexto.",
    hoverMe: "Passe o mouse",
    menu: "Menu",
    tooltip: "Tooltip",
    tooltipBody: "Dica útil",
    showToast: "Mostrar toast",
    toastSaved: "Alterações salvas",
    toastError: "Não foi possível salvar",
    errorToast: "Toast de erro",
    upload: "Enviando",
    alertTitle: "Atenção",
    alertBody: "Nova versão disponível.",
    faq1: "É acessível?",
    faq1Body: "Sim. Funciona com teclado e leitor de tela.",
    faq2: "Dá para mudar o tema?",
    faq2Body: "Pelos tokens da biblioteca compartilhada.",
    shortcut: "Paleta de comandos",
    account: "Conta",
    security: "Segurança",
    accountBody: "Nome, e-mail e avatar.",
    securityBody: "Senha e sessões.",
    loadingTitle: "Carregamento",
    thinking: "Pensando…",
    underline: "Sublinhado",
    italic: "Itálico",
    bold: "Negrito",
  },
});

function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className={className ?? "flex flex-wrap items-center gap-3"}>
        {children}
      </CardContent>
    </Card>
  );
}

export function ComponentsView() {
  const t = useMessages(messages);
  const [volume, setVolume] = useState(60);
  const orbNames = useMessages(ORB_TASK_LABELS);
  return (
    <div className="grid items-start gap-4 lg:grid-cols-2">
      <Section title={t.buttons}>
        <Button>{t.save}</Button>
        <Button variant="secondary">{t.cancel}</Button>
        <Button variant="outline">{t.cancel}</Button>
        <Button variant="ghost">{t.cancel}</Button>
        <Button variant="destructive">
          <Trash2Icon data-icon="inline-start" />
          {t.delete}
        </Button>
        <Button variant="link">{t.cancel}</Button>
        <Button disabled>
          <Spinner data-icon="inline-start" />
          {t.saving}
        </Button>
        <Button size="icon" variant="outline" aria-label={t.add}>
          <PlusIcon />
        </Button>
        <ButtonGroup>
          <Button variant="outline" size="sm">
            1D
          </Button>
          <Button variant="outline" size="sm">
            1W
          </Button>
          <Button variant="outline" size="sm">
            1M
          </Button>
        </ButtonGroup>
      </Section>

      <Section title={t.badges}>
        <StatusBadge tone="success">{t.running}</StatusBadge>
        <StatusBadge tone="warning">{t.partial}</StatusBadge>
        <StatusBadge tone="danger">{t.failed}</StatusBadge>
        <StatusBadge>{t.unknown}</StatusBadge>
        <Badge>{t.new}</Badge>
        <Badge variant="secondary">{t.readOnly}</Badge>
        <Badge variant="outline">v6.0.0</Badge>
      </Section>

      <Section title={t.inputs} className="flex flex-col gap-4">
        <Field>
          <FieldLabel htmlFor="email">{t.email}</FieldLabel>
          <Input id="email" type="email" placeholder="name@example.com" />
          <FieldDescription>{t.emailHint}</FieldDescription>
        </Field>
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput aria-label={t.search} placeholder={t.search} />
        </InputGroup>
        <Textarea aria-label={t.notes} placeholder={t.notes} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input aria-label={t.invalid} aria-invalid placeholder={t.invalid} />
          <Input aria-label={t.disabled} disabled placeholder={t.disabled} />
        </div>
      </Section>

      <Section title={t.selection} className="flex flex-col gap-5">
        <Select defaultValue="sa-east-1">
          <SelectTrigger aria-label={t.region} className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sa-east-1">sa-east-1</SelectItem>
            <SelectItem value="us-east-1">us-east-1</SelectItem>
            <SelectItem value="eu-west-1">eu-west-1</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex flex-wrap items-center gap-6">
          <Label>
            <Checkbox defaultChecked />
            {t.terms}
          </Label>
          <Label>
            <Switch defaultChecked />
            {t.notifications}
          </Label>
        </div>
        <RadioGroup
          defaultValue="free"
          aria-label={t.plan}
          className="flex gap-6"
        >
          <Label>
            <RadioGroupItem value="free" />
            {t.free}
          </Label>
          <Label>
            <RadioGroupItem value="pro" />
            {t.pro}
          </Label>
        </RadioGroup>
        <div className="flex items-center gap-4">
          <Slider
            aria-label={t.volume}
            value={volume}
            onValueChange={(value) => setVolume(value as number)}
            className="max-w-xs"
          />
          <span className="text-sm text-muted-foreground tabular-nums">
            {volume}%
          </span>
        </div>
        <ToggleGroup multiple defaultValue={["bold"]}>
          <ToggleGroupItem value="bold" aria-label={t.bold}>
            <BoldIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label={t.italic}>
            <ItalicIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label={t.underline}>
            <UnderlineIcon />
          </ToggleGroupItem>
        </ToggleGroup>
      </Section>

      <Section title={t.overlays}>
        <Dialog>
          <DialogTrigger render={<Button variant="outline" />}>
            {t.openDialog}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.editProfile}</DialogTitle>
              <DialogDescription>{t.editProfileBody}</DialogDescription>
            </DialogHeader>
            <Input aria-label={t.email} placeholder="name@example.com" />
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                {t.cancel}
              </DialogClose>
              <DialogClose render={<Button />}>{t.save}</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <AlertDialog>
          <AlertDialogTrigger render={<Button variant="destructive" />}>
            {t.delete}
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t.deleteProject}</AlertDialogTitle>
              <AlertDialogDescription>
                {t.deleteProjectBody}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
              <AlertDialogAction variant="destructive">
                {t.delete}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Popover>
          <PopoverTrigger render={<Button variant="outline" />}>
            {t.popover}
          </PopoverTrigger>
          <PopoverContent>
            <PopoverHeader>
              <PopoverTitle>{t.popover}</PopoverTitle>
              <PopoverDescription>{t.popoverBody}</PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>
            {t.menu}
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <MailIcon />
              {t.email}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <BellIcon />
              {t.notifications}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <Trash2Icon />
              {t.delete}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Tooltip>
          <TooltipTrigger render={<Button variant="ghost" />}>
            {t.tooltip}
          </TooltipTrigger>
          <TooltipContent>{t.tooltipBody}</TooltipContent>
        </Tooltip>
        <HoverCard>
          <HoverCardTrigger render={<Button variant="link" />}>
            {t.hoverMe}
          </HoverCardTrigger>
          <HoverCardContent className="flex gap-3">
            <Avatar>
              <AvatarFallback>MJ</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <div className="font-medium">Majapi</div>
              <div className="text-muted-foreground">@majapisoftwares</div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </Section>

      <Section title={t.feedback} className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => toast.success(t.toastSaved)}>
            {t.showToast}
          </Button>
          <Button variant="outline" onClick={() => toast.error(t.toastError)}>
            {t.errorToast}
          </Button>
        </div>
        <Alert>
          <BellIcon />
          <AlertTitle>{t.alertTitle}</AlertTitle>
          <AlertDescription>{t.alertBody}</AlertDescription>
        </Alert>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span>{t.upload}</span>
            <span className="text-muted-foreground tabular-nums">66%</span>
          </div>
          <Progress value={66} aria-label={t.upload} />
        </div>
        <div className="flex items-center gap-3">
          <Spinner />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
      </Section>

      <Section title={t.loadingTitle} className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          {[
            LATTICE_VARIANTS,
            LENS_VARIANTS,
            RING_VARIANTS,
            HELIX_VARIANTS,
            MORPH_VARIANTS,
          ].map((family) => (
            <div key={family[0]} className="flex flex-wrap items-center gap-2">
              {family.map((variant) => (
                <Tooltip key={variant}>
                  <TooltipTrigger
                    render={<Button variant="ghost" size="icon-lg" />}
                    aria-label={variant}
                  >
                    <Orb variant={variant} size={24} />
                  </TooltipTrigger>
                  <TooltipContent>
                    {variant} · {orbNames[variant]}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Orb pill label={t.thinking} />
          <Button disabled>
            <Spinner data-icon="inline-start" />
            {t.saving}
          </Button>
        </div>
      </Section>

      <Section title={t.display} className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-6">
          <AvatarGroup>
            {["AL", "BR", "CS", "DM"].map((initials) => (
              <Avatar key={initials} size="lg">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            ))}
          </AvatarGroup>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {t.shortcut}
            <KbdGroup>
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
          </div>
        </div>
        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">{t.account}</TabsTrigger>
            <TabsTrigger value="security">{t.security}</TabsTrigger>
          </TabsList>
          <TabsContent
            value="account"
            className="text-sm text-muted-foreground"
          >
            {t.accountBody}
          </TabsContent>
          <TabsContent
            value="security"
            className="text-sm text-muted-foreground"
          >
            {t.securityBody}
          </TabsContent>
        </Tabs>
        <Accordion>
          <AccordionItem value="a11y">
            <AccordionTrigger>{t.faq1}</AccordionTrigger>
            <AccordionContent>{t.faq1Body}</AccordionContent>
          </AccordionItem>
          <AccordionItem value="theme">
            <AccordionTrigger>{t.faq2}</AccordionTrigger>
            <AccordionContent>{t.faq2Body}</AccordionContent>
          </AccordionItem>
        </Accordion>
      </Section>
    </div>
  );
}
