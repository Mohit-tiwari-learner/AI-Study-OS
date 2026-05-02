import { Outlet, Link, createRootRoute } from "@tanstack/react-router";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="nm-flat max-w-md text-center p-10">
        <h1 className="text-7xl font-display font-bold text-primary">404</h1>
        <h2 className="mt-3 text-xl font-display font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          That route doesn't exist in AI Study OS.
        </p>
        <div className="mt-6">
          <Link to="/dashboard" className="nm-button inline-flex px-5 py-2.5 text-sm font-semibold text-primary">
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: NotFoundComponent,
});


// Root layout components can be added here if needed
