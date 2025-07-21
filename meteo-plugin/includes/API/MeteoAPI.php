<?php

interface MeteoAPI{
    function getData(string $url): string;
}

?>