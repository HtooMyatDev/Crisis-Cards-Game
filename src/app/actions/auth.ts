export async function loginAction(
    prevState: Record<string, unknown>,
    formData: FormData
) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    try {
        // Send credentials to the backend
        const response = await fetch('/api/auth/login', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })

        // format the data from the backend
        const data = await response.json()
        const getFieldError = (field: string) => {
            return data.errors?.properties?.[field]?.errors?.[0] || ''
        }
        if (response.ok) {
            return {
                success: true,
                message: data.message || 'Login successful!',
                errors: {},
                redirectTo: data.route || '/admin/dashboard'
            }
        }
        else {
            // Handle validation errors
            const fieldErrors: Record<string, string> = {};
            if (data.errors) {
                fieldErrors.email = getFieldError("email");
                fieldErrors.password = getFieldError("password");
            }

            return {
                success: false,
                message: data.message || 'Login failed. Please try again.',
                errors: fieldErrors,
                redirectTo: null
            }
        }
    }
    catch (error) {
        console.log(error)
        return {
            success: false,
            message: 'Network error. Please check your connection and try again',
            errors: {},
            redirectTo: null
        }
    }
}
