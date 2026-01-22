import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CleanCodeRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useSnippets() {
  return useQuery({
    queryKey: [api.snippets.list.path],
    queryFn: async () => {
      const res = await fetch(api.snippets.list.path);
      if (!res.ok) throw new Error("Failed to fetch history");
      return api.snippets.list.responses[200].parse(await res.json());
    },
  });
}

export function useSnippet(id: number | null) {
  return useQuery({
    queryKey: [api.snippets.get.path, id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.snippets.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch snippet");
      return api.snippets.get.responses[200].parse(await res.json());
    },
  });
}

export function useCleanSnippet() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CleanCodeRequest) => {
      // Validate input before sending
      const validated = api.snippets.clean.input.parse(data);
      
      const res = await fetch(api.snippets.clean.path, {
        method: api.snippets.clean.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.snippets.clean.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        if (res.status === 500) {
           const error = api.snippets.clean.responses[500].parse(await res.json());
           throw new Error(error.message);
        }
        throw new Error("Failed to deobfuscate code");
      }
      
      return api.snippets.clean.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.snippets.list.path] });
      toast({
        title: "Success",
        description: "Code deobfuscated successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });
}
