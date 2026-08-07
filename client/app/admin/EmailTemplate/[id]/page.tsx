"use client";

import { useParams } from "next/navigation";
import EditEmail from "../components/EditEmail";

export default function EditEmailPage() {
    const params = useParams();
    const { id } = params;

    return (
        <EditEmail id={id as string} />
    );
}
