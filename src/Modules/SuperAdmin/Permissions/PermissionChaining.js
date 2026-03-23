/* eslint-disable no-unused-vars */
const rules = [
    { prefix: "DELETE", requires: "VIEW" },
    { prefix: "EDIT", requires: "VIEW" },
  ];

export const buildPermissionDependencies = (containers, ) => {
    const permissionDependenciesById = {};
    containers.forEach((container) => {
      container.permissions.forEach((perm) => {
        rules.forEach((rule) => {
          if (perm.name.startsWith(rule.prefix)) {
            const viewPerm = container.permissions.find(p =>
              p.name === perm.name.replace(rule.prefix, rule.requires)
            );
            if (viewPerm) {
              permissionDependenciesById[perm.permissionId] = [viewPerm.permissionId];
            }
          }
        });
      });
    });
  
    return permissionDependenciesById;
  };
  export const applyPermissionDependencies = (permissionsState, permissionDependenciesById) => {
    const newState = { ...permissionsState };
  
    Object.entries(newState).forEach(([containerId, perms]) => {
      Object.entries(perms).forEach(([permissionId, checked]) => {
        if (!checked) return;
  
        const dep = permissionDependenciesById[permissionId];
        if (dep?.length) {
          dep.forEach((depId) => {
            perms[depId] = true;
          });
        }
      });
    });
  
    return newState;
  };
  
  