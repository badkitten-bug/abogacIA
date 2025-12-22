"""
Abstracción de LLM Provider.
Permite cambiar entre Ollama (local) y Groq (cloud) con una sola línea.

Para cambiar de IA:
1. Modificar LLM_PROVIDER en .env: "ollama" o "groq"
2. Si usas Groq, agregar GROQ_API_KEY
"""
from abc import ABC, abstractmethod
from typing import Optional
import httpx
import json

from ..config import settings


class LLMProvider(ABC):
    """Interfaz abstracta para proveedores de LLM."""
    
    @abstractmethod
    async def generate(
        self,
        prompt: str,
        context: str = "",
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> str:
        """
        Genera respuesta del LLM.
        
        Args:
            prompt: Pregunta del usuario
            context: Contexto relevante (documentos recuperados)
            system_prompt: Instrucciones del sistema
            temperature: Creatividad (0.0 - 1.0)
            max_tokens: Máximo de tokens en respuesta
        
        Returns:
            Texto de respuesta generado
        """
        pass
    
    @abstractmethod
    def get_provider_name(self) -> str:
        """Retorna nombre del provider."""
        pass


class OllamaProvider(LLMProvider):
    """
    Provider para Ollama (LLM local).
    Requiere tener Ollama instalado y ejecutándose.
    """
    
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.model = settings.OLLAMA_MODEL
    
    async def generate(
        self,
        prompt: str,
        context: str = "",
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> str:
        """Genera respuesta usando Ollama."""
        
        # Construir prompt con contexto
        full_prompt = self._build_prompt(prompt, context, system_prompt)
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json={
                        "model": self.model,
                        "prompt": full_prompt,
                        "stream": False,
                        "options": {
                            "temperature": temperature,
                            "num_predict": max_tokens
                        }
                    }
                )
                response.raise_for_status()
                result = response.json()
                return result.get("response", "")
                
            except httpx.ConnectError:
                raise ConnectionError(
                    f"No se pudo conectar a Ollama en {self.base_url}. "
                    "¿Está Ollama ejecutándose? Ejecuta: ollama serve"
                )
            except Exception as e:
                raise RuntimeError(f"Error generando respuesta con Ollama: {str(e)}")
    
    def _build_prompt(
        self,
        prompt: str,
        context: str,
        system_prompt: Optional[str]
    ) -> str:
        """Construye el prompt completo."""
        
        if system_prompt is None:
            system_prompt = self._get_default_system_prompt()
        
        if context:
            return f"""{system_prompt}

CONTEXTO LEGAL RELEVANTE:
{context}

PREGUNTA DEL USUARIO:
{prompt}

RESPUESTA:"""
        else:
            return f"""{system_prompt}

PREGUNTA DEL USUARIO:
{prompt}

RESPUESTA:"""
    
    def _get_default_system_prompt(self) -> str:
        """Prompt del sistema por defecto para asistente legal peruano."""
        return """Eres ABOGAC.IA, un asistente legal especializado en derecho peruano.

REGLAS:
1. Responde SOLO basándote en el contexto legal proporcionado
2. Si no tienes información suficiente, indícalo claramente
3. Cita las fuentes legales específicas (número de ley, artículo, etc.)
4. Usa lenguaje claro y accesible para personas sin formación legal
5. NO inventes leyes ni artículos que no estén en el contexto
6. Al final, sugiere consultar con un abogado para casos específicos

IMPORTANTE: Tus respuestas son informativas, no constituyen asesoría legal profesional."""
    
    def get_provider_name(self) -> str:
        return f"Ollama ({self.model})"


class GroqProvider(LLMProvider):
    """
    Provider para Groq Cloud API.
    Gratis y muy rápido. Requiere API key.
    """
    
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model = settings.GROQ_MODEL
        self.base_url = "https://api.groq.com/openai/v1"
        
        if not self.api_key:
            raise ValueError(
                "GROQ_API_KEY no configurado. "
                "Obtén tu API key gratis en: https://console.groq.com"
            )
    
    async def generate(
        self,
        prompt: str,
        context: str = "",
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> str:
        """Genera respuesta usando Groq API."""
        
        if system_prompt is None:
            system_prompt = self._get_default_system_prompt()
        
        # Construir mensaje con contexto
        user_message = prompt
        if context:
            user_message = f"""CONTEXTO LEGAL RELEVANTE:
{context}

PREGUNTA DEL USUARIO:
{prompt}"""
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ]
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.model,
                        "messages": messages,
                        "temperature": temperature,
                        "max_tokens": max_tokens
                    }
                )
                response.raise_for_status()
                result = response.json()
                return result["choices"][0]["message"]["content"]
                
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 401:
                    raise ValueError("API key de Groq inválida")
                raise RuntimeError(f"Error de Groq API: {e.response.text}")
            except Exception as e:
                raise RuntimeError(f"Error generando respuesta con Groq: {str(e)}")
    
    def _get_default_system_prompt(self) -> str:
        """Prompt del sistema por defecto."""
        return """Eres ABOGAC.IA, un asistente legal especializado en derecho peruano.

REGLAS:
1. Responde SOLO basándote en el contexto legal proporcionado
2. Si no tienes información suficiente, indícalo claramente
3. Cita las fuentes legales específicas (número de ley, artículo, etc.)
4. Usa lenguaje claro y accesible para personas sin formación legal
5. NO inventes leyes ni artículos que no estén en el contexto
6. Al final, sugiere consultar con un abogado para casos específicos

IMPORTANTE: Tus respuestas son informativas, no constituyen asesoría legal profesional."""
    
    def get_provider_name(self) -> str:
        return f"Groq ({self.model})"


def get_llm_provider() -> LLMProvider:
    """
    Factory para obtener el LLM provider configurado.
    
    ⭐ PARA CAMBIAR DE IA, SOLO MODIFICA LLM_PROVIDER EN .env ⭐
    
    Opciones:
        - LLM_PROVIDER=ollama  -> Usa Ollama local (gratis, necesita GPU)
        - LLM_PROVIDER=groq    -> Usa Groq Cloud (gratis, muy rápido)
    """
    provider = settings.LLM_PROVIDER.lower()
    
    if provider == "groq":
        return GroqProvider()
    elif provider == "ollama":
        return OllamaProvider()
    else:
        raise ValueError(
            f"LLM_PROVIDER '{provider}' no soportado. "
            "Usa 'ollama' o 'groq'"
        )
