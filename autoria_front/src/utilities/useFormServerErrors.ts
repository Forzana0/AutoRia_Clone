import { useCallback } from "react";
import type { FormInstance } from "antd";
import type { NamePath } from "rc-field-form/lib/interface";

interface ServerValidationErrors {
    [key: string]: string[];
}

export const useFormServerErrors = <T,>(form: FormInstance<T>) => {
    const setServerErrors = useCallback((errors: ServerValidationErrors) => {
        const normalizedErrors = Object.entries(errors).map(
            ([field, messages]) => ({
                name: field.toLowerCase() as NamePath,
                errors: messages,
            })
        );

        form.setFields(normalizedErrors);
    }, [form]);

    return setServerErrors;
};

