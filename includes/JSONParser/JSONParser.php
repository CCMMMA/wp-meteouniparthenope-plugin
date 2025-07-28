<?php

namespace includes\JSONParser;
interface JSONParser
{
    public function parseMultipleFromJSON($json): array;
    public function parseSingleFromJSON($json);
}

?>