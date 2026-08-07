import { Suspense } from "react";
import StoryPage from "./StoryPage/storyPage";

export default function ViewMoreMemberStories(){
    return(
<Suspense>
    <StoryPage/>
</Suspense>
    )
}