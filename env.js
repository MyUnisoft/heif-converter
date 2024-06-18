const [,, arg] = process.argv;

if (arg === "env") {
  const VCPKG_LIB_ROOT = process.env.VCPKG_LIB_ROOT
    ? process.env.VCPKG_LIB_ROOT.split("\\").join("/")
    : "";
  console.log(VCPKG_LIB_ROOT);
}

if (arg === "platform") {
  let platform = process.platform;
  if (platform.includes("win")) {
    platform = "windows";
  }
  else if (platform !== "linux") {
    platform = "mac";
  }

  console.log(`${process.arch}-${platform}`);
}
