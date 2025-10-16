<?php

namespace Meteouniparthenope\ctps;

class Model extends MeteoCustomPostType
{
    private string $name;

    public function __construct()
    {
        $this->name = "";
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName($name)
    {
        $this->name = $name;
    }
}

?>