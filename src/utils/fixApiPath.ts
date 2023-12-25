function fixApiPath(path: string): string {
  return path[0] !== '/' ? `/${path}` : path;
}
export default fixApiPath;
