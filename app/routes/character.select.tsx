import { useLoaderData, redirect } from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/node";
import CharacterCard from "~/components/selectCharacter/CharacterCard";
import CharacterList from "~/components/selectCharacter/CharacterList";
import { serverClient } from "~/utils/Supabase/ServerClient";

export async function loader({ request }: LoaderFunctionArgs) {
  const response = new Response();

  const supabase = serverClient(request, response);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect("/login");

  const { data: currentUserData } = await supabase
    .from("profiles")
    .select("id,avatar_url,full_name,current_character")
    .eq("id", user?.id)
    .single();

  const { data: currentCharacter } = await supabase
    .from("characters")
    .select("id,name,model_url,postedby")
    .eq("id", currentUserData?.current_character)
    .single();

  const { data: myCharacter } = await supabase
    .from("characters")
    .select("id,name,model_url,postedby")
    .eq("postedby", user.id);

  const { data: favorites } = await supabase
    .from("favorites")
    .select("characters(*)")
    .eq("user_id", user.id);

  return { myCharacter, favorites, currentCharacter };
}

export default function SelectCharacter() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <CharacterList title="使用中">
        <CharacterCard
          id={data.currentCharacter?.id}
          name={data.currentCharacter?.name}
          model_url={data.currentCharacter?.model_url}
          key={data.currentCharacter?.id}
          postedby={data.currentCharacter?.postedby}
        />
      </CharacterList>

      <CharacterList title="あなたのキャラクター">
        {data?.myCharacter?.map((character) => {
          return (
            <CharacterCard
              id={character.id}
              name={character.name}
              model_url={character.model_url}
              key={character.id}
              postedby={character.postedby}
            />
          );
        })}
      </CharacterList>

      <CharacterList title="お気に入りのキャラクター">
        {data?.favorites?.map((favorite: any) => {
          return (
            <CharacterCard
              id={favorite.characters.id}
              name={favorite.characters.name}
              model_url={favorite.characters.model_url}
              key={favorite.characters.id}
              postedby={favorite.characters.postedby}
            />
          );
        })}
      </CharacterList>
    </div>
  );
}
