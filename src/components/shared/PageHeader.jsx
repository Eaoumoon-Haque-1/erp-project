/**
 * @file Shared reusable UI/workflow component: PageHeader.
 * Sections: reusable helpers, component behavior, accessibility, and rendered UI.
 * Changing this file can affect many features; keep props backward-compatible when possible.
 */
import { Link } from "react-router-dom";

function PageHeader({ title, subtitle, actionLabel, actionTo, actions = [] }) {
  return (
    <header className={"erp-form-header"}>
      <div>
        <h1>{title}</h1>
        {subtitle && <p className={"erp-page-subtitle"}>{subtitle}</p>}
      </div>

      <div className={"erp-header-actions"}>
        {actionLabel && actionTo && (
          <Link className={"primary-button"} to={actionTo}>
            {actionLabel}
          </Link>
        )}

        {actions.map((action, index) => {
          if (action.to) {
            return (
              <Link
                key={`${action.label}-${index}`}
                className={
                  action.variant === "secondary"
                    ? "secondary-button"
                    : "primary-button"
                }
                to={action.to}
              >
                {action.label}
              </Link>
            );
          }

          return (
            <button
              key={`${action.label}-${index}`}
              type={"button"}
              className={
                action.variant === "secondary"
                  ? "secondary-button"
                  : "primary-button"
              }
              onClick={action.onClick}
            >
              {action.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}

export default PageHeader;
