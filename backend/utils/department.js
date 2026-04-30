const normalizeDepartment = (department) => {
  if (!department) return department;
  if (department === "General Medicine") return "General";
  return department;
};

const buildDepartmentFilter = (department) => {
  const normalized = normalizeDepartment(department);
  if (!normalized) return null;
  if (normalized === "General") {
    return { $in: ["General", "General Medicine"] };
  }
  return normalized;
};

module.exports = {
  normalizeDepartment,
  buildDepartmentFilter,
};