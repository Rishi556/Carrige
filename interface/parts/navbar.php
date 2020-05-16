<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <a class="navbar-brand" href="/">Raven</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto w-100">
            <?php if (isset($who_am_i) and $who_am_i !== false) {
                ?>
                <li class="nav-item">
                    <a class="nav-link" href="/@<?php echo $who_am_i; ?>/feed">My Feed</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/@<?php echo $who_am_i; ?>">My Profile</a>
                </li>
            <?php
            } ?>
            <li class="nav-item">
                <a class="nav-link" href="/created">New Posts</a>
            </li>
        </ul>
        <ul class="nav navbar-nav ml-auto w-100 justify-content-end">
            <?php if (isset($who_am_i) and $who_am_i !== false) { ?>
                <li class="nav-item">
                    <a href="#" class="send-caw btn btn-outline-danger my-2 my-sm-0">New Caw</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/@<?php echo $who_am_i; ?>"><?php echo $who_am_i; ?></a>
                </li>
               <?php } else { ?>
            <li class="nav-item">
                <a href="/login" class="btn btn-outline-danger my-2 my-sm-0">Log In</a>
            </li>
            <?php } ?>
        </ul>
    </div>
</nav>