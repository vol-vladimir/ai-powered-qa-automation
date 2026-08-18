/** Repeated routes — do not scatter path literals across specs. */
export enum AppRoute {
  Login = "/login",
  Dashboard = "/",
  Programs = "/programs",
  Calendar = "/calendar",
  Validation = "/validation",
  AiAssist = "/cli",
}

/** Repeated UI copy verified in POMs. */
export enum UiCopy {
  DashboardHeading = "Dashboard",
  DashboardWelcome = "Welcome to Didaxis Studio",
  ProgramsHeading = "Programs",
}
