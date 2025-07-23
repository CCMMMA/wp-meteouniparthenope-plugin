<?php

namespace includes\cpts;

use includes\cpts\MeteoCustomPostType;

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