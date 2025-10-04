export const lifecycle = {
  enter(path: string[]) {
    // hook: analytics, logs, abort previous, etc.
    // console.log("[lifecycle.enter]", path.join("."));
  },
  leave(path: string[]) {
    // console.log("[lifecycle.leave]", path.join("."));
  },
};
