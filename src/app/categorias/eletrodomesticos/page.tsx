import CategoriaPage, { generateMetadata as metadataCategoria } from "@/app/categoria/[nome]/page";
import { APPLIANCES } from "@/lib/appliances";
import { connection } from "next/server";

const props = () => ({ params: Promise.resolve({ nome: APPLIANCES }) });
export async function generateMetadata() {
  await connection();
  return metadataCategoria(props());
}
export default async function EletrodomesticosPage() {
  await connection();
  return CategoriaPage(props());
}
