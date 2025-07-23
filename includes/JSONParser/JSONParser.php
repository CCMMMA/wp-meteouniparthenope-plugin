<?php

namespace includes\JSONParser;
interface JSONParser
{
    public function parseFromJSON($json): array;
}

?>