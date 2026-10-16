import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useSignupMutation } from "../../store/authApi";
import { setCredentials } from "../../store/authSlice";
import Input from "../../../../components/ui/Input";
import Button from "../../../../components/ui/Button";
import emailjs from "@emailjs/browser";

const signupSchema = z
  .object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres").trim(),
    email: z
      .string()
      .min(1, "El correo es obligatorio")
      .email("Correo electrónico inválido")
      .trim()
      .toLowerCase(),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export default function SignupForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [signupMutation, { isLoading }] = useSignupMutation();
  const [globalError, setGlobalError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data) => {
    setGlobalError("");
    try {
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
      };
      const response = await signupMutation(payload).unwrap();
      dispatch(setCredentials({ user: response.data, token: response.token }));

      try {
        await emailjs.send(
          "service_noarme9",
          "template_j0225k8",
          {
            user_name: payload.name,
            user_email: payload.email,
          },
          "j-3XGK0Gpytzm5UwR",
        );
      } catch (emailErr) {
        console.error("No se pudo enviar el correo de bienvenida:", emailErr);
      }

      navigate("/profile");
      
    } catch (err) {
      setGlobalError(err.data?.message || "No se pudo completar el registro. Inténtalo nuevamente.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          label="Nombre"
          type="text"
          {...register("name")}
          error={errors.name?.message}
          icon={<User className="h-5 w-5 text-(--color-text-muted)" />}
          placeholder="Ingresa tu nombre completo"
          className="bg-(--color-surface-input) dark:bg-[#2c2c2c]"
        />
      </div>

      <div>
        <Input
          label="Correo electrónico"
          type="email"
          {...register("email")}
          error={errors.email?.message}
          icon={<Mail className="h-5 w-5 text-(--color-text-muted)" />}
          placeholder="Ingresa tu correo"
          className="bg-(--color-surface-input) dark:bg-[#2c2c2c]"
        />
      </div>

      <div>
        <Input
          label="Contraseña"
          type={showPassword ? "text" : "password"}
          {...register("password")}
          error={errors.password?.message}
          icon={<Lock className="h-5 w-5 text-(--color-text-muted)" />}
          placeholder="Crea una contraseña"
          className="bg-(--color-surface-input) dark:bg-[#2c2c2c]"
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-(--color-text-muted) hover:text-(--color-primary-600) dark:hover:text-green-400 transition-colors focus:outline-none"
              aria-label="Mostrar u ocultar contraseña"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          }
        />
      </div>

      <div>
        <Input
          label="Confirmar contraseña"
          type={showConfirmPassword ? "text" : "password"}
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
          icon={<Lock className="h-5 w-5 text-(--color-text-muted)" />}
          placeholder="Confirma tu contraseña"
          className="bg-(--color-surface-input) dark:bg-[#2c2c2c]"
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-(--color-text-muted) hover:text-(--color-primary-600) dark:hover:text-green-400 transition-colors focus:outline-none"
              aria-label="Mostrar u ocultar confirmación de contraseña"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          }
        />
      </div>

      {globalError && (
        <div className="p-3 bg-(--color-danger-50) dark:bg-(--color-danger-900) border border-(--color-danger-200) dark:border-red-800 text-(--color-danger-600) dark:text-(--color-danger-400) rounded-lg text-center font-semibold text-sm">
          {globalError}
        </div>
      )}

      <Button
        type="submit"
        variant="solid"
        size="lg"
        fullWidth
        isLoading={isLoading}
        className="w-full mt-2 bg-(--color-primary-600) hover:bg-(--color-primary-700) shadow-md"
      >
        {!isLoading && (
          <>
            Crear cuenta <ArrowRight className="w-5 h-5" />
          </>
        )}
      </Button>
    </form>
  );
}
