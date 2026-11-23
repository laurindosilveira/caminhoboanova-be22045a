interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface WindowEventMap {
  beforeinstallprompt: BeforeInstallPromptEvent;
}

interface Navigator {
  standalone?: boolean;
}

interface Window {
  __APP_VERSION__?: string;
  __APP_BUILD_DATE__?: string;
}
