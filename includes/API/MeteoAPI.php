<?php

namespace Meteouniparthenope\API;

interface MeteoAPI
{
    function getData(string $url): string;
}

?>