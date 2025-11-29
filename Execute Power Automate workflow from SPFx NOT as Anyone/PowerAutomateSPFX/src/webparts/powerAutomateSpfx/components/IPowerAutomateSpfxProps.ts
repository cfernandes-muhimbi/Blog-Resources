export interface IPowerAutomateSpfxProps {
  url: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  userEmail: string;
  triggerFlow: (body: any, flowUrl: string) => Promise<any>;
}
