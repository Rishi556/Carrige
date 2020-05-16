<?php
function handle_feed($feed_url) {
    $feed = json_decode(file_get_contents($feed_url));

    if ($feed->success) {
        if (sizeof($feed->data) > 0) {
            foreach ($feed->data as $index => $post) {
                $v_up = 0;
                $reader_voted = false;
                if ($post->Votes !== null) {
                    foreach (json_decode($post->Votes) as $vote) {
                        if ($vote->VoteValue > 0) {
                            $v_up += 1;
                        }
                        if (isset($vote->voter_name)) {
                            $vote->Voter = $vote->voter_name;
                        }
                        if (isset($vote->Username)) {
                            $vote->Voter = $vote->Username;
                        }
                        if (isset($_SESSION["username"]) and $_SESSION["username"] === $vote->Voter) {
                            $reader_voted = true;
                        }
                    }
                }
                if ($post->Children !== null) {
                    $comments = sizeof(json_decode($post->Children));
                } else {
                    $comments = 0;
                }
                ?>
                <div class="card flex-row flex-wrap mt-3">
                    <div class="card-header border-0">
                        <a href="/@<?php echo $post->Author; ?>"><img style="height: 50px; width: 50px;"
                                                                      src="https://images.hive.blog/u/<?php echo $post->Author; ?>/avatar"
                                                                      alt="User"></a>
                    </div>
                    <div onclick="window.location.href = '/post/<?php echo $post->Permlink; ?>';" class="card-block px-2">
                        <p><strong><?php echo $post->Author; ?></strong></p>
                        <p class="card-text"><?php echo htmlspecialchars($post->Body,ENT_QUOTES+ENT_HTML5); ?></p>
                    </div>
                    <div class="w-100"></div>
                    <div class="card-footer w-100 text-muted">
                        <i class="fa<?php echo $reader_voted ? "s" : "r" ?> fa-thumbs-up" data-author="<?php echo $post->Author; ?>" data-postid="<?php echo $post->Permlink; ?>"></i><?php echo $v_up; ?>&nbsp;<i
                            class="fas fa-comments" data-author="<?php echo $post->Author; ?>" data-postid="<?php echo $post->Permlink; ?>"></i><?php echo $comments; ?>&nbsp;
                        <?php if ($post->Author === $_SESSION["username"]) {?><i data-author="<?php echo $post->Author; ?>" data-postid="<?php echo $post->Permlink; ?>" class="far fa-trash-alt"></i><?php } ?>
                        &nbsp;&nbsp;<?php echo date("Y-m-d H:i:s", $post->PostTime); ?>
                    </div>
                </div>
                <?php
            }
        } else {
            print("This feed is empty! =(");
        }
    } else {
        print("This feed is empty or the server isn't happy =(");
    }
};

function handle_post($post_url) {
    $feed = json_decode(file_get_contents($post_url));

    if ($feed->success) {
        if (sizeof($feed->data) > 0) {
            $post = $feed->data[0];
                raw_handle_post($post);
        } else {
            print("This feed is empty! =(");
        }
    } else {
        print("This feed is empty or the server isn't happy =(");
    }
};

function raw_handle_post($post) {
    $v_up = 0;
    $reader_voted = false;
    if ($post->Votes !== null) {
        foreach (json_decode($post->Votes) as $vote) {
            if ($vote->VoteValue > 0) {
                $v_up += 1;
            }
            if (isset($_SESSION["username"]) and $_SESSION["username"] === $vote->Voter) {
                $reader_voted = true;
            }
        }
    }
    if ($post->Children !== null) {
        $comments = sizeof(json_decode($post->Children));
    } else {
        $comments = 0;
    }
    ?>
    <?php
    if (isset($post->ParentID) and $post->ParentID !== null and $post->ParentID !== "") {
        ?><a href="/post/<?php echo $post->ParentID; ?>">Go To Parent Post</a><?php
    }
    ?>
    <div class="card flex-row flex-wrap mt-3">
        <div class="card-header border-0">
            <a href="/@<?php echo $post->Author; ?>"><img style="height: 50px; width: 50px;"
                                                          src="https://images.hive.blog/u/<?php echo $post->Author; ?>/avatar"
                                                          alt="User"></a>
        </div>
        <div onclick="window.location.href = '/post/<?php echo $post->Permlink; ?>';" class="card-block px-2">
            <p><strong><?php echo $post->Author; ?></strong></p>
            <p class="card-text"><?php echo htmlspecialchars($post->Body,ENT_QUOTES+ENT_HTML5); ?></p>
        </div>
        <div class="w-100"></div>
        <div class="card-footer w-100 text-muted">
            <i class="fa<?php echo $reader_voted ? "s" : "r" ?> fa-thumbs-up" data-author="<?php echo $post->Author; ?>" data-postid="<?php echo $post->Permlink; ?>"></i><?php echo $v_up; ?>&nbsp;<i
                class="fas fa-comments" data-author="<?php echo $post->Author; ?>" data-postid="<?php echo $post->Permlink; ?>"></i><?php echo $comments; ?>&nbsp;
            <?php if ($post->Author === $_SESSION["username"]) {?><i data-author="<?php echo $post->Author; ?>" data-postid="<?php echo $post->Permlink; ?>" class="far fa-trash-alt"></i><?php } ?>
            &nbsp;&nbsp;<?php echo date("Y-m-d H:i:s", $post->PostTime); ?>
            <?php
            if ($post->Children !== null) {
                foreach (json_decode($post->Children) as $child) {
                    raw_handle_comment($child);
                }
            }
            ?>
        </div>
    </div>
    <?php
}

function raw_handle_comment($post) {
    $v_up = 0;
    $reader_voted = false;
    if (isset($post->Votes) and $post->Votes !== null) {
        if (is_string($post->Votes)) {
            $post->Votes = json_decode($post->Votes);
        }
        foreach ($post->Votes as $vote) {
            if ($vote->VoteValue > 0) {
                $v_up += 1;
            }
            if (isset($vote->voter_name)) {
                $vote->Voter = $vote->voter_name;
            }
            if (isset($_SESSION["username"]) and $_SESSION["username"] === $vote->Voter) {
                $reader_voted = true;
            }
        }
    }

    $comments = 0;
    if (isset($post->Children) and $post->Children !== null) {
        if (is_string($post->Children)) {
            $comments = sizeof(json_decode($post->Children));
        } else {
            $comments = sizeof($post->Children);
        }
    }
    ?>
    <?php
        if (isset($post->ParentID) and $post->ParentID !== null and $post->ParentID !== "") {
            ?><a href="/post/<?php echo $post->ParentID; ?>">Go To Parent Post</a><?php
        }
    ?>
    <div class="card flex-row flex-wrap mt-3">
        <div class="card-header border-0">
            <a href="/@<?php echo $post->Author; ?>"><img style="height: 50px; width: 50px;"
                                                          src="https://images.hive.blog/u/<?php echo $post->Author; ?>/avatar"
                                                          alt="User"></a>
        </div>
        <div onclick="window.location.href = '/post/<?php echo $post->Permlink; ?>';" class="card-block px-2">
            <p><strong><?php echo $post->Author; ?></strong></p>
            <p class="card-text"><?php echo htmlspecialchars($post->Body,ENT_QUOTES+ENT_HTML5); ?></p>
        </div>
        <div class="w-100"></div>
        <div class="card-footer w-100 text-muted">
            <i class="fa<?php echo $reader_voted ? "s" : "r" ?> fa-thumbs-up" data-author="<?php echo $post->Author; ?>" data-postid="<?php echo $post->Permlink; ?>"></i><?php echo $v_up; ?>&nbsp;<i
                class="fas fa-comments" data-author="<?php echo $post->Author; ?>" data-postid="<?php echo $post->Permlink; ?>"></i><?php echo $comments; ?>&nbsp;
            <?php if ($post->Author === $_SESSION["username"]) {?><i data-author="<?php echo $post->Author; ?>" data-postid="<?php echo $post->Permlink; ?>" class="far fa-trash-alt"></i><?php } ?>
            &nbsp;&nbsp;<?php echo date("Y-m-d H:i:s", $post->PostTime); ?>
            <?php
            if (isset($post->Children) and $post->Children !== null) {
                if (is_string($post->Children)) {
                    $post->Children = json_decode($post->Children);
                }
                foreach ($post->Children as $child) {
                    raw_handle_comment($child);
                }
            }
            ?>
        </div>
    </div>
    <?php
}