import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Hiring Desk — Mini Hiring Pipeline',description:'A clear and auditable candidate pipeline for recruiters.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
