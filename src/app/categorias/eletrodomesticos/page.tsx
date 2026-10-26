import CategoriaPage, { generateMetadata as metadataCategoria } from "@/app/categoria/[nome]/page";
import { APPLIANCES } from "@/lib/appliances";

const props = () => ({ params: Promise.resolve({ nome: APPLIANCES }) });
export function generateMetadata() { return metadataCategoria(props()); }
export default function EletrodomesticosPage() { return CategoriaPage(props()); }
