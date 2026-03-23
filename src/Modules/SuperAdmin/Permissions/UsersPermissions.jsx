import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./UsersPermissions.module.css";
import { getLang, getToken } from "../../../Utils";
import { useFetchData } from "../../../Hooks/UseFetchData";
import { API_BASE_URL } from "../../../Constants";
import { applyPermissionDependencies, buildPermissionDependencies } from "./PermissionChaining";

export default function UsersPermissions() {
  const { t } = useTranslation("userPermissions");
  const lang = getLang();
  const token = getToken();

  const { data } = useFetchData({
    baseUrl: `${API_BASE_URL}Container`,
    queryKey: ["containers"],
    token,
  });

  const containers = useMemo(() => data?.data ?? [], [data]);

  const [permissionsState, setPermissionsState] = useState({});

  /* ------------------ INIT STATE ------------------ */
  useEffect(() => {
    if (!containers.length) return;

    const initialState = {};

    containers.forEach((container) => {
      initialState[container.containerId] = Object.fromEntries(
        container.permissions.map((p) => [p.permissionId, false])
      );
    });

    setPermissionsState(initialState);
  }, [containers]);

  /* ------------------ HELPERS ------------------ */

  const isAllSelected = (container) =>
    container.permissions.every(
      (p) => permissionsState[container.containerId]?.[p.permissionId]
    );

  const toggleAll = (container) => {
    const next = !isAllSelected(container);

    setPermissionsState((prev) => ({
      ...prev,
      [container.containerId]: Object.fromEntries(
        container.permissions.map((p) => [p.permissionId, next])
      ),
    }));
  };

  const permissionDependenciesById = buildPermissionDependencies(containers);
    const togglePermission = (containerId, permissionId, checked) => {
      setPermissionsState((prev) => {
        const nextState = {
          ...prev,
          [containerId]: {
            ...prev[containerId],
            [permissionId]: checked,
          },
        };
    
        if (checked) return applyPermissionDependencies(nextState, permissionDependenciesById);
        return nextState;
      });
    };

  /* ------------------ RENDER ------------------ */

  return (
    <div className={styles.app}>
      <main className={styles.content}>
        <div className={styles.container}>
          <header className={styles.headerSection}>
            <h1 className={styles.pageTitle}>
              {t("pageTitle")}
            </h1>
          </header>

          <div className={styles.tableContainer}>
            <div className={styles.contentWrapper}>
              <form className={styles.permissionsForm}>
                <h3 className={styles.formTitle}>
                  {t("formTitle")}
                </h3>

                <p className={styles.formDesc}>
                  {t("formDescription")}
                </p>

                {containers.map((container) => (
                  <div
                    key={container.containerId}
                    className={styles.permissionsBox}
                  >
                    {/* --------- BOX HEADER --------- */}
                    <div className={styles.boxTitleContainer}>
                      <h4 className={styles.boxTitle}>
                        {lang === "ar"
                          ? container.name.split("|")[1]
                          : container.name.split("|")[0]}
                      </h4>

                      <button
                        type="button"
                        className={styles.btnView}
                        onClick={() => toggleAll(container)}
                      >
                        {isAllSelected(container)
                          ? t("unselectGroup")
                          : t("selectGroup")}
                      </button>
                    </div>

                    {/* --------- PERMISSIONS GRID --------- */}
                    <div className={styles.permsGrid}>
                      {container.permissions.map((perm) => (
                        <div
                          key={perm.permissionId}
                          className={styles.permItem}
                        >
                          <input
                            type="checkbox"
                            className={styles.checkbox}
                            checked={
                              permissionsState[container.containerId]?.[
                                perm.permissionId
                              ] || false
                            }
                            onChange={(e) =>
                              togglePermission(
                                container.containerId,
                                perm.permissionId,
                                e.target.checked
                              )
                            }
                          />

                          <span className={styles.permLabel}>
                            {lang === "ar"
                              ? perm.viewName.split("|")[1]
                              : perm.viewName.split("|")[0]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
