"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  ExternalLink,
  Globe,
  ImagePlus,
  Instagram,
  Link2,
  LoaderCircle,
  MessageCircle,
  Palette,
  Share2,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { normalizeLinkUrl, usernameError } from "@/convex/lib/onboarding_utils";
import { useDebounce } from "@/app/hooks/use-debounce";
import styles from "./onboarding.module.css";

type Step = 1 | 2 | 3 | 4;
const steps = ["Seu perfil", "Seu endereço", "Primeiro link", "Tudo pronto"];
const titles = [
  {
    kicker: "PRIMEIRO, A SUA IDENTIDADE",
    title: "Vamos dar um rosto à sua página.",
    description: "Como você quer que as pessoas conheçam você ou sua marca?",
  },
  {
    kicker: "UM ENDEREÇO PARA CHAMAR DE SEU",
    title: "Qual vai ser o seu link na bio?",
    description: "Escolha um endereço curto e fácil de compartilhar.",
  },
  {
    kicker: "O PRIMEIRO PASSO DO SEU VISITANTE",
    title: "Para onde seu link vai levar?",
    description:
      "Pode ser seu WhatsApp, Instagram, site ou outro endereço importante.",
  },
  {
    kicker: "SUA PÁGINA GANHOU FORMA",
    title: "Seu próximo capítulo tem um link.",
    description:
      "Tudo salvo. Confira sua página e abra o painel para continuar personalizando.",
  },
];

function Brand() {
  return (
    <a href="/" className={styles.brand} aria-label="Freelinnk, início">
      <span>
        F<i />
      </span>
      Freelinnk<b>.</b>
    </a>
  );
}

function PagePreview({
  name,
  username,
  bio,
  photo,
  linkTitle,
  linkUrl,
}: {
  name: string;
  username: string;
  bio: string;
  photo: string | null;
  linkTitle: string;
  linkUrl: string;
}) {
  return (
    <aside className={styles.previewPanel} aria-label="Prévia da sua página">
      <div className={styles.previewHeading}>
        <span>
          <span /> SUA PÁGINA GANHA FORMA
        </span>
        <Palette size={18} />
      </div>
      <div className={styles.previewPhone}>
        <div className={styles.previewBrowser}>
          <Globe size={10} /> freelinnk.com/{username || "seuendereco"}
        </div>
        <div className={styles.previewBody}>
          <div className={styles.previewAvatar}>
            {photo ? (
              <img src={photo} alt="Sua foto na prévia" />
            ) : (
              <UserRound size={30} />
            )}
          </div>
          <h2>{name.trim() || "Seu nome ou marca"}</h2>
          <span className={styles.previewUsername}>
            @{username || "seuendereco"}
          </span>
          <p>
            {bio.trim() ||
              "Uma frase sobre você ou sobre o que faz sua marca especial."}
          </p>
          <div className={styles.previewLinks}>
            {linkTitle.trim() ? (
              <div className={styles.previewLink}>
                <span>
                  <Link2 size={17} />
                </span>
                <div>
                  <strong>{linkTitle.trim()}</strong>
                  <small>
                    {normalizeLinkUrl(linkUrl)
                      ? new URL(normalizeLinkUrl(linkUrl)!).hostname
                      : "Seu endereço de destino"}
                  </small>
                </div>
                <ArrowUpRight size={14} />
              </div>
            ) : (
              <div className={styles.emptyLink}>
                <Link2 size={19} />
                <span>
                  Seu primeiro link
                  <br />
                  vai aparecer aqui.
                </span>
              </div>
            )}
          </div>
          <div className={styles.previewPowered}>
            <span>F</span> FEITO COM FREELINNK
          </div>
        </div>
      </div>
      <p className={styles.previewCaption}>
        Prévia simplificada da sua página.
        <br />
        Você poderá ajustar cores e estilo no painel.
      </p>
    </aside>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const data = useQuery(
    api.onboarding.getOnboardingData,
    isAuthenticated ? {} : "skip",
  );
  const saveProfile = useMutation(api.onboarding.saveProfile);
  const saveUsername = useMutation(api.onboarding.saveUsername);
  const saveFirstLink = useMutation(api.onboarding.saveFirstLink);
  const finish = useMutation(api.onboarding.completeOnboarding);
  const generateUploadUrl = useMutation(
    api.lib.customizations.generateUploadUrl,
  );
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkKind, setLinkKind] = useState("site");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [slow, setSlow] = useState(false);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  const initializedUser = useRef<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debouncedUsername = useDebounce(username, 400);
  const formatError = usernameError(username);
  const availability = useQuery(
    api.lib.usernames.checkUsernameAvailability,
    isAuthenticated &&
      !usernameError(debouncedUsername) &&
      debouncedUsername !== data?.username
      ? { username: debouncedUsername }
      : "skip",
  );
  const ownsUsername = !!username && username === data?.username;
  const checkingUsername =
    !formatError &&
    !ownsUsername &&
    (debouncedUsername !== username || availability === undefined);
  const canUseUsername =
    !formatError &&
    (ownsUsername || (!checkingUsername && availability?.available === true));
  const publicUrl = `${origin || "https://freelinnk.com"}/${username}`;
  const addressHost = origin ? new URL(origin).host : "freelinnk.com";

  useEffect(() => {
    setOrigin(window.location.origin);
    return () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    };
  }, []);
  useEffect(() => {
    if (!data || !user) return;
    if (data.status.completed) {
      router.replace("/dashboard");
      return;
    }
    if (initializedUser.current === user.id) return;
    initializedUser.current = user.id;
    setName(data.profile?.displayName || user.fullName || "");
    setBio(data.profile?.bio ?? "");
    setPhoto(data.profile ? data.profile.photoUrl : user.imageUrl || null);
    setUsername(data.username);
    setLinkTitle(data.firstLink?.title ?? "");
    setLinkUrl(data.firstLink?.url ?? "");
    setStep(data.status.currentStep as Step);
    setReady(true);
  }, [data, user, router]);
  useEffect(() => {
    if (ready) {
      heading.current?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [step, ready]);
  useEffect(
    () => () => {
      if (photoFile && photo) URL.revokeObjectURL(photo);
    },
    [photoFile, photo],
  );
  const waiting =
    !isLoaded ||
    (!!isSignedIn && (authLoading || (isAuthenticated && (!data || !ready))));
  useEffect(() => {
    if (!waiting) {
      setSlow(false);
      return;
    }
    const timer = setTimeout(() => setSlow(true), 12000);
    return () => clearTimeout(timer);
  }, [waiting]);

  function goTo(next: Step) {
    setError(null);
    setStep(next);
  }
  function showError(cause: unknown, fallback: string) {
    setError(
      cause instanceof ConvexError && typeof cause.data === "string"
        ? cause.data
        : fallback,
    );
  }

  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setError("Escolha uma imagem JPG, PNG ou WebP com até 5 MB.");
      return;
    }
    setError(null);
    setPhotoFile(file);
    setPhoto(URL.createObjectURL(file));
    setRemovePhoto(false);
  }

  async function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (!name.trim() || name.trim().length > 80) {
      setError("Informe um nome com até 80 caracteres.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      let photoStorageId: Id<"_storage"> | undefined;
      if (photoFile) {
        const url = await generateUploadUrl({});
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": photoFile.type },
          body: photoFile,
        });
        if (!response.ok) throw new Error("upload");
        const uploaded = await response.json();
        if (typeof uploaded.storageId !== "string") throw new Error("upload");
        photoStorageId = uploaded.storageId as Id<"_storage">;
      }
      const saved = await saveProfile({
        displayName: name.trim(),
        bio: bio.trim(),
        photoStorageId,
        photoUrl:
          !photoFile && photo?.startsWith("https://") ? photo : undefined,
        removePhoto,
      });
      setPhoto(saved.photoUrl);
      setPhotoFile(null);
      setRemovePhoto(false);
      setName(name.trim());
      setBio(bio.trim());
      goTo(2);
    } catch (cause) {
      showError(cause, "Não foi possível salvar seu perfil. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  async function submitUsername(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !canUseUsername) return;
    setBusy(true);
    setError(null);
    try {
      await saveUsername({ username });
      goTo(3);
    } catch (cause) {
      showError(
        cause,
        "Não foi possível reservar esse endereço. Tente novamente.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function submitLink(event?: FormEvent<HTMLFormElement>, skip = false) {
    event?.preventDefault();
    if (busy) return;
    const normalized = normalizeLinkUrl(linkUrl);
    if (
      !skip &&
      (linkTitle.trim().length < 3 || linkTitle.trim().length > 100)
    ) {
      setError("Dê ao link um título com 3 a 100 caracteres.");
      return;
    }
    if (!skip && !normalized) {
      setError(
        "Informe um endereço válido, como exemplo.com ou https://exemplo.com.",
      );
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await saveFirstLink(
        skip ? { skip: true } : { title: linkTitle.trim(), url: normalized! },
      );
      if (skip) {
        setLinkTitle(data?.firstLink?.title ?? "");
        setLinkUrl(data?.firstLink?.url ?? "");
      } else {
        setLinkTitle(linkTitle.trim());
        setLinkUrl(normalized!);
      }
      goTo(4);
    } catch (cause) {
      showError(
        cause,
        "Não foi possível salvar seu link. Seus dados continuam aqui para tentar novamente.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function complete() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await finish({});
      router.replace("/dashboard");
    } catch (cause) {
      showError(cause, "Não foi possível abrir o painel. Tente novamente.");
      setBusy(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(false), 2500);
    } catch {
      setError(
        "Não foi possível copiar. Selecione o endereço da sua página e copie manualmente.",
      );
    }
  }

  async function shareLink() {
    if (!navigator.share) {
      await copyLink();
      return;
    }
    try {
      await navigator.share({
        title: name || "Minha página no Freelinnk",
        text: "Meus links em um só lugar.",
        url: publicUrl,
      });
    } catch (cause) {
      if (!(cause instanceof Error && cause.name === "AbortError"))
        setError(
          "Não foi possível compartilhar agora. Você pode copiar o endereço.",
        );
    }
  }

  let statusView;
  if (isLoaded && !isSignedIn)
    statusView = (
      <>
        <span className={styles.statusIcon}>
          <Link2 />
        </span>
        <span className={styles.kicker}>SUA PÁGINA COMEÇA AQUI</span>
        <h1>
          Um novo endereço.
          <br />A mesma essência.
        </h1>
        <p>
          Entre na sua conta para configurar seu perfil e reunir seus links em
          um só lugar.
        </p>
        <SignInButton mode="modal" forceRedirectUrl="/onboarding">
          <button className={styles.primary}>
            Entrar e continuar <ArrowRight size={17} />
          </button>
        </SignInButton>
        <div className={styles.signup}>
          Ainda não tem uma conta?{" "}
          <SignUpButton mode="modal" forceRedirectUrl="/onboarding">
            <button>Criar conta grátis</button>
          </SignUpButton>
        </div>
      </>
    );
  else if (
    isLoaded &&
    isSignedIn &&
    !authLoading &&
    (!isAuthenticated || data === null)
  )
    statusView = (
      <>
        <span className={styles.statusIcon}>
          <ShieldCheck />
        </span>
        <h1>
          Vamos reconectar
          <br />
          sua conta?
        </h1>
        <p>
          Sua sessão não pôde ser confirmada. Atualize a página para tentar
          novamente.
        </p>
        <button
          className={styles.primary}
          onClick={() => window.location.reload()}
        >
          Tentar novamente <ArrowRight size={17} />
        </button>
      </>
    );
  else if (!ready || data?.status.completed)
    statusView = (
      <>
        <LoaderCircle className={styles.spinner} size={28} />
        <h1>Preparando seu espaço.</h1>
        <p>
          {slow
            ? "A conexão está demorando um pouco. Seus dados salvos continuam na sua conta."
            : "Estamos buscando os avanços da sua página."}
        </p>
        {slow && (
          <button
            className={styles.secondary}
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </button>
        )}
      </>
    );

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Brand />
        <span className={styles.headerNote}>
          <ShieldCheck size={14} /> Seus avanços são salvos ao continuar.
        </span>
      </header>
      {statusView ? (
        <section className={styles.statusCard}>{statusView}</section>
      ) : (
        <div className={styles.workspace}>
          <section
            className={styles.wizard}
            aria-label="Configuração da sua página"
          >
            <nav
              aria-label="Etapas da configuração"
              className={styles.progress}
            >
              <ol>
                {steps.map((label, index) => (
                  <li
                    key={label}
                    aria-current={step === index + 1 ? "step" : undefined}
                  >
                    <button
                      type="button"
                      disabled={
                        busy || index + 1 > (data?.status.currentStep ?? step)
                      }
                      onClick={() => goTo((index + 1) as Step)}
                    >
                      <span>
                        {index + 1 < step ? (
                          <Check size={13} />
                        ) : (
                          String(index + 1).padStart(2, "0")
                        )}
                      </span>
                      <strong>{label}</strong>
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
            <div className={styles.formBody}>
              <div className={styles.stepHeading}>
                <span className={styles.kicker}>{titles[step - 1].kicker}</span>
                <h1 ref={heading} tabIndex={-1}>
                  {titles[step - 1].title}
                </h1>
                <p>{titles[step - 1].description}</p>
              </div>
              {error && (
                <div className={styles.error} role="alert">
                  {error}
                </div>
              )}
              {step === 1 && (
                <form onSubmit={submitProfile} noValidate>
                  <div className={styles.photoRow}>
                    <div className={styles.avatar}>
                      {photo ? (
                        <img src={photo} alt="Foto do seu perfil" />
                      ) : (
                        <UserRound size={29} />
                      )}
                    </div>
                    <div>
                      <button
                        type="button"
                        className={styles.photoButton}
                        disabled={busy}
                        onClick={() => fileInput.current?.click()}
                      >
                        <ImagePlus size={15} />
                        {photo ? "Trocar foto" : "Adicionar foto"}
                      </button>
                      <span>Opcional · JPG, PNG ou WebP · até 5 MB</span>
                      {photo && (
                        <button
                          type="button"
                          className={styles.removePhoto}
                          disabled={busy}
                          onClick={() => {
                            setPhoto(null);
                            setPhotoFile(null);
                            setRemovePhoto(true);
                          }}
                        >
                          <Trash2 size={11} /> Remover foto
                        </button>
                      )}
                    </div>
                    <input
                      ref={fileInput}
                      onChange={choosePhoto}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className={styles.hidden}
                      aria-label="Escolher foto de perfil"
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="display-name">
                      Nome de exibição <span>Obrigatório</span>
                    </label>
                    <input
                      id="display-name"
                      value={name}
                      maxLength={80}
                      onChange={(event) => setName(event.target.value)}
                      disabled={busy}
                      placeholder="Seu nome ou o nome da sua marca"
                      autoComplete="nickname"
                      required
                      aria-describedby="name-help"
                    />
                    <small id="name-help">
                      É assim que seu nome vai aparecer na página.
                    </small>
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="bio">
                      Sua bio <span>Opcional · {bio.length}/150</span>
                    </label>
                    <textarea
                      id="bio"
                      value={bio}
                      maxLength={150}
                      rows={3}
                      onChange={(event) => setBio(event.target.value)}
                      disabled={busy}
                      placeholder="Conte em uma frase o que as pessoas vão encontrar por aqui."
                    />
                  </div>
                  <div className={styles.actions}>
                    <button
                      className={styles.primary}
                      disabled={busy || !name.trim()}
                    >
                      {busy ? (
                        <>
                          <LoaderCircle className={styles.spinner} size={17} />{" "}
                          Salvando perfil
                        </>
                      ) : (
                        <>
                          Continuar para o endereço <ArrowRight size={17} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
              {step === 2 && (
                <form onSubmit={submitUsername} noValidate>
                  <div className={styles.field}>
                    <label htmlFor="username">Endereço da sua página</label>
                    <div
                      className={`${styles.usernameField} ${username && !checkingUsername && !canUseUsername ? styles.invalidField : ""}`}
                    >
                      <span>{addressHost}/</span>
                      <input
                        id="username"
                        value={username}
                        maxLength={30}
                        onChange={(event) =>
                          setUsername(
                            event.target.value.toLowerCase().replace(/\s/g, ""),
                          )
                        }
                        disabled={busy}
                        autoComplete="off"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        placeholder="suamarca"
                        aria-describedby="username-feedback username-help"
                        aria-invalid={
                          !!username && !checkingUsername && !canUseUsername
                        }
                      />
                      {checkingUsername ? (
                        <LoaderCircle size={17} className={styles.spinner} />
                      ) : canUseUsername ? (
                        <CheckCircle2 size={17} />
                      ) : null}
                    </div>
                    <div
                      id="username-feedback"
                      className={`${styles.feedback} ${canUseUsername ? styles.available : ""}`}
                      aria-live="polite"
                    >
                      {!username
                        ? "Escolha o endereço que você vai compartilhar na bio."
                        : formatError ||
                          (checkingUsername
                            ? "Verificando disponibilidade…"
                            : ownsUsername
                              ? "Esse endereço já está reservado para você."
                              : canUseUsername
                                ? "Disponível! Esse endereço pode ser seu."
                                : availability?.error ||
                                  "Esse endereço já está em uso. Tente outro.")}
                    </div>
                    <small id="username-help">
                      De 3 a 30 caracteres. Letras, números, hífen e sublinhado.
                    </small>
                  </div>
                  <div className={styles.tip}>
                    <Link2 size={19} />
                    <p>
                      Escolha algo fácil de lembrar.
                      <br />
                      <strong>Seu nome, sua marca ou seu negócio.</strong>
                    </p>
                  </div>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.back}
                      onClick={() => goTo(1)}
                      disabled={busy}
                    >
                      <ArrowLeft size={15} /> Voltar
                    </button>
                    <button
                      className={styles.primary}
                      disabled={busy || !canUseUsername}
                    >
                      {busy ? (
                        <>
                          <LoaderCircle className={styles.spinner} size={17} />{" "}
                          Reservando
                        </>
                      ) : (
                        <>
                          Reservar meu endereço <ArrowRight size={17} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
              {step === 3 && (
                <form onSubmit={submitLink} noValidate>
                  <div
                    className={styles.presets}
                    role="group"
                    aria-label="Tipo do primeiro link"
                  >
                    {[
                      {
                        id: "whatsapp",
                        icon: MessageCircle,
                        label: "WhatsApp",
                        title: "Fale no WhatsApp",
                      },
                      {
                        id: "instagram",
                        icon: Instagram,
                        label: "Instagram",
                        title: "Meu Instagram",
                      },
                      {
                        id: "site",
                        icon: Globe,
                        label: "Site ou outro",
                        title: "Visite meu site",
                      },
                    ].map(({ id, icon: Icon, label, title }) => (
                      <button
                        key={id}
                        type="button"
                        aria-pressed={linkKind === id}
                        disabled={busy}
                        onClick={() => {
                          setLinkKind(id);
                          if (
                            !linkTitle ||
                            [
                              "Fale no WhatsApp",
                              "Meu Instagram",
                              "Visite meu site",
                            ].includes(linkTitle)
                          )
                            setLinkTitle(title);
                        }}
                      >
                        <Icon size={16} /> {label}
                      </button>
                    ))}
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="link-title">Título do botão</label>
                    <input
                      id="link-title"
                      value={linkTitle}
                      maxLength={100}
                      onChange={(event) => setLinkTitle(event.target.value)}
                      disabled={busy}
                      placeholder="Ex.: Conheça meu trabalho"
                      aria-describedby="link-title-help"
                    />
                    <small id="link-title-help">
                      O texto que seu visitante vai ver. Mínimo de 3 caracteres.
                    </small>
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="link-url">Endereço de destino</label>
                    <input
                      id="link-url"
                      inputMode="url"
                      value={linkUrl}
                      onChange={(event) => setLinkUrl(event.target.value)}
                      disabled={busy}
                      autoComplete="url"
                      autoCapitalize="none"
                      spellCheck={false}
                      placeholder={
                        linkKind === "whatsapp"
                          ? "https://wa.me/5511999999999"
                          : linkKind === "instagram"
                            ? "https://instagram.com/seuperfil"
                            : "seusite.com.br"
                      }
                      aria-describedby="link-url-help"
                    />
                    <small id="link-url-help">
                      Pode colar o endereço completo ou sem https://.
                    </small>
                  </div>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.back}
                      onClick={() => goTo(2)}
                      disabled={busy}
                    >
                      <ArrowLeft size={15} /> Voltar
                    </button>
                    <button className={styles.primary} disabled={busy}>
                      {busy ? (
                        <>
                          <LoaderCircle className={styles.spinner} size={17} />{" "}
                          Salvando
                        </>
                      ) : (
                        <>
                          Salvar e revisar <ArrowRight size={17} />
                        </>
                      )}
                    </button>
                  </div>
                  <button
                    type="button"
                    className={styles.skip}
                    disabled={busy}
                    onClick={() => submitLink(undefined, true)}
                  >
                    Adicionar meu primeiro link depois
                  </button>
                </form>
              )}
              {step === 4 && (
                <div className={styles.success}>
                  <div className={styles.successNotice}>
                    <CheckCircle2 size={21} />
                    <div>
                      <strong>Perfil e endereço salvos.</strong>
                      <span>
                        {data?.firstLink
                          ? "Seu primeiro link também está na página."
                          : "Você pode adicionar seus links pelo painel."}
                      </span>
                    </div>
                  </div>
                  <label className={styles.addressLabel} htmlFor="public-url">
                    SEU NOVO ENDEREÇO
                  </label>
                  <div className={styles.publicAddress}>
                    <input
                      id="public-url"
                      readOnly
                      value={publicUrl}
                      aria-label="Endereço da sua página"
                    />
                    <button
                      type="button"
                      onClick={copyLink}
                      aria-label="Copiar endereço da página"
                    >
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                  <span className={styles.copyFeedback} role="status">
                    {copied
                      ? "Endereço copiado!"
                      : "Pronto para colocar na sua bio."}
                  </span>
                  <div className={styles.successLinks}>
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver minha página <ExternalLink size={14} />
                    </a>
                    <button type="button" onClick={shareLink}>
                      Compartilhar <Share2 size={14} />
                    </button>
                  </div>
                  <div className={styles.nextSteps}>
                    <span>SEU PRÓXIMO PASSO NO PAINEL</span>
                    <p>
                      <Palette size={17} /> Personalize as cores e o estilo da
                      página.
                    </p>
                    <p>
                      <Link2 size={17} /> Organize seus links e contatos.
                    </p>
                  </div>
                  <button
                    type="button"
                    className={styles.primary}
                    disabled={busy}
                    onClick={complete}
                  >
                    {busy ? (
                      <>
                        <LoaderCircle className={styles.spinner} size={17} />{" "}
                        Abrindo seu painel
                      </>
                    ) : (
                      <>
                        Concluir e abrir meu painel <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                  <button
                    className={styles.skip}
                    type="button"
                    disabled={busy}
                    onClick={() => goTo(1)}
                  >
                    Revisar meus dados
                  </button>
                </div>
              )}
            </div>
            <div className={styles.formFooter}>
              <ShieldCheck size={13} /> Seu progresso fica salvo na sua conta.
            </div>
          </section>
          <div className={styles.desktopPreview}>
            <PagePreview
              name={name}
              username={username}
              bio={bio}
              photo={photo}
              linkTitle={linkTitle}
              linkUrl={linkUrl}
            />
          </div>
          <details className={styles.mobilePreview}>
            <summary>
              <span>
                <Sparkles size={15} /> Ver prévia da minha página
              </span>
              <ChevronDown size={16} />
            </summary>
            <PagePreview
              name={name}
              username={username}
              bio={bio}
              photo={photo}
              linkTitle={linkTitle}
              linkUrl={linkUrl}
            />
          </details>
        </div>
      )}
      <footer className={styles.footer}>
        Freelinnk · Seu negócio merece mais que um link na bio.
      </footer>
    </main>
  );
}
