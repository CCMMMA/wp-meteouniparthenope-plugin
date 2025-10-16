<?php

namespace Meteouniparthenope\shorcodes;

// ============================================
// BASE INTERFACE FOR SHORTCODES
// ============================================

interface ShortcodeInterface {
    public function render($atts);
    public function enqueueAssets();
    public function prepareData($atts);
}

?>