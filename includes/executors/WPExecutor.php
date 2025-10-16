<?php

namespace Meteouniparthenope\executors;

use Meteouniparthenope\ctps\MeteoCustomPostType;

interface WPExecutor
{
    /**
     * @param MeteoCustomPostType[] $posts
     */
    public function executePostCreation(MeteoCustomPostType $post): int;

    public function executePostsCreation(array $posts): int;
}

?>