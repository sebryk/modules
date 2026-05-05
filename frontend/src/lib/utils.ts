import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { data } from "@/components/app-sidebar"

export function cn(...inputs: ClassValue[]) {
   return twMerge(clsx(inputs))
}

const { navMain } = data

export function getPageTitle(pathname: string) {
   return navMain.find((item) => item.url === pathname)?.title ?? "Главная"
}
