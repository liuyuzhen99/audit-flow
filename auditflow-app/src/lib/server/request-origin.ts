import { headers } from "next/headers";

export async function getRequestOrigin() {
  // 为了避免在 K8s Ingress / 反向代理下由于端口映射导致的 ECONNREFUSED 错误，
  // 服务端组件内部请求自身的 API 路由时，应始终直接访问本地回路地址和端口。
  const port = process.env.PORT || "3000";
  return `http://127.0.0.1:${port}`;
}
