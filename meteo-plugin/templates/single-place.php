<?php
get_header();
?>

<div class="wrap">
    <main id="primary" class="site-main">
        <article id="post-<?php the_ID(); ?>" <?php post_class('place-single'); ?>>
            <header class="entry-header">
                <h1 class="entry-title"><?php the_title(); ?></h1>
            </header>

            <div class="entry-content">
                <?php if (get_the_content()): ?>
                    <?php the_content(); ?>
                <?php endif; ?>

                <!-- Map -->
                <p>
                    <button class="btn btn-primary" type="button" data-toggle="collapse" data-target="#map-collapse" aria-expanded="false" aria-controls="map-collapse">
                        Show map
                    </button>
                </p>
                <div class="collapse" id="map-collapse">
                    <div class="card card-body">
                        <div id="map-container" class="container-fluid">
                            <?php echo do_shortcode('[map_shortcode]'); ?>
                            <div id="map-image">
        
                            </div>
                            <div id="map">
        
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Forecast table -->
                <div id="forecast">
                    <div class="forecast-container" class="container-fluid" style="display: block">
                        <?php echo do_shortcode('[forecast_shortcode]'); ?>
                        <div class="row">
                            <div class="col">
                                <div class="card">
                                    <div class="card-body">
                                        <div id="forecast-box-title"></div>
                                        <div id="forecast-box"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Control (form di input) -->
                <div id="control">
                    <div id="control-container" class="container-fluid" style="display: visible">
                        <?php echo do_shortcode('[control_shortcode]'); ?>
                        <div class="row">
                            <div class="col">
                                <div class="card">
                                    <div class="card-body">
                                        <label for="input-group mb-3">Date and time:</label>
                                        <div class="input-group mb-3">
                                            <input class="form-control" type="date" id="control-select-date">
                                        </div>
                                        <div class="input-group mb-3">
                                            <select class="form-control" id="control-select-time"></select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col">
                                <div class="card">
                                    <div class="card-body">
                                        <label for="control-select-product">Products:</label>
                                        <div class="input-group mb-3">
                                            <select class="form-control" id="control-select-product">
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col">
                                <div class="card">
                                    <div class="card-body">
                                        <label for="control-select-product">Outputs:</label>
                                        <div class="input-group mb-3">
                                            <select class="form-control" id="control-select-output">
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button type="button" class="btn btn-outline-primary" id="generate-button">Generate plot</button>
                    </div>
                </div>

                <!-- Plot -->
                <div id="plot-container" class="container-fluid" style="display: visible">
                    <?php echo do_shortcode('[plot_shortcode control_forms="FULL"]'); ?>
                    <div class="row d-flex justify-content-center">
                        <div class="col>">
                            <div class="card">
                                <div class="card-body">
                                    <div id="plot-image-container" class="container-fluid">
                                        <!--
                                        <table class="table" style="table-layout: auto;">
                                            <tbody id="plot-table-tbody">
                                                <tr>
                                                    <td colspan="3" class="text-center p-2">
                                                        <img id="topBarImage" class="img-fluid">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td class="text-center align-middle p-2" style="width: auto;">
                                                        <img id="leftBarImage" class="img-fluid">
                                                    </td>
                                                    <td class="text-center align-middle p-2">
                                                        <div id="table-image-container">
                                                        </div>
                                                    </td>
                                                    <td class="text-center align-middle p-2" style="width: auto;">
                                                        <img id="rightBarImage" class="img-fluid">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td></td>
                                                    <td class="text-center align-middle p-2">
                                                        <img id="bottomBarImage" class="img-fluid mx-auto d-block" style="max-width: 758px; height: auto;">
                                                    </td>
                                                    <td></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        -->
                                    </div>


                                    <!--
                                    <table id="plot-table">
                                        <tbody id="plot-table-tbody">
                                            <tr>
                                                <td colspan="3">
                                                    <img id="topBarImage" height="64px"/>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td><img id="leftBarImage" width="64px" /></td>
                                                <td>
                                                    <div id="plot">
                                                        <div id="plot-loading"></div>
                                                        <div id="plotMap">
                                                            <img id="plotMap-image" src="" style="width: 100%; height: 100%;"/>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><img id="rightBarImage" width="64px" /></td>
                                            </tr>
                                            <tr>
                                                <td colspan="3">
                                                    <img id="bottomBarImage" height="64px" />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    -->
                                    <h5 id="card_title" class="card-title"></h5>
                                    <p id="card_text" class="card-text"></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <p>
                    <button class="btn btn-primary" type="button" data-toggle="collapse" data-target="#chart-collapse" aria-expanded="false" aria-controls="chart-collapse">
                        Show chart
                    </button>
                </p>
                <!-- Chart -->
                <div class="collapse" id="chart-collapse">
                    <div class="chart-container container-fluid">
                        <?php echo do_shortcode('[chart_shortcode]'); ?>
                        <div class="row">
                            <div class="col">
                                <div class="card">
                                    <div class="card-body">
                                        <div id="chart" style="height: 50vh">
                                            <div id="chart-box" class="box">
                                                <div id="chart-container-canvasDiv" style="height: 50vh; width: inherit">
                                                    <!--
                                                    <div id="chart-container-canvasjs" class="canvasjs-chart-container">
                                                        
                                                    </div>
                                                    -->
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Real-time chart -->
                <div id="real-time-chart-container" class="container-fluid">
                    <?php echo do_shortcode('[live_chart_shortcode]'); ?>
                    <div class="real-time-chart-container">
                        <div id="controls">
                            <label for="real-time-chart-select">
                                Choose the place you want to see wind speed and direction
                            </label>
                            <select id="real-time-chart-select">
                                <option value="ws1">Centro Direzionale</option>
                                <option value="ws2">Gaiola</option>
                                <option value="ws3">Città della Scienza</option>
                                <option value="ws4">Marina di Stabia</option>
                                <option value="ws8">Sant'Agata</option>
                            </select>
                        </div>
                        <div id="controls">
                            <button id="scrollLeft">← Scorri Indietro</button>
                            <button id="scrollRight">Scorri Avanti →</button>
                            <button id="goToLatest">Vai agli Ultimi Dati</button>
                            <span id="info">Dati visualizzati: 0/0</span>
                        </div>
                        <div id="chartContainer">
                            <canvas id="myChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    </main>
    <!--
    <script src="https://cdn.canvasjs.com/ga/canvasjs.min.js"></script>
    <script src="https://cdn.canvasjs.com/ga/canvasjs.stock.min.js"></script>
    -->
</div>

<?php
get_footer();
?>