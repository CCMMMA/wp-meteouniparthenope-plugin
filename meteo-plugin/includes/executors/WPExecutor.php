<?php

interface WPExecutor{
    /**
     * @param MeteoCustomPostType[] $posts
     */
    public function executePostCreation(MeteoCustomPostType $post): int;
    public function executePostsCreation(array $posts): int;
}

?>