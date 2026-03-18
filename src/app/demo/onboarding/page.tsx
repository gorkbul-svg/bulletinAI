"use client";
export default function Page() {
  if (typeof window !== "undefined") {
    window.location.href = "/demo/dashboard";
  }
  return null;
}
