CREATE OR REPLACE FUNCTION increment_ai_usage(
  p_user_id UUID,
  p_feature TEXT,
  p_usage_date DATE,
  p_limit INT
) RETURNS TABLE(allowed BOOLEAN, current_count INT) AS $$
DECLARE
  v_count INT;
BEGIN
  INSERT INTO ai_daily_usage (user_id, feature, usage_date, request_count)
  VALUES (p_user_id, p_feature, p_usage_date, 1)
  ON CONFLICT (user_id, usage_date, feature)
  DO UPDATE SET
    request_count = ai_daily_usage.request_count + 1,
    updated_at = NOW()
  WHERE ai_daily_usage.request_count < p_limit
  RETURNING request_count INTO v_count;

  IF v_count IS NULL THEN
    SELECT request_count INTO v_count
    FROM ai_daily_usage
    WHERE user_id = p_user_id AND feature = p_feature AND usage_date = p_usage_date;

    RETURN QUERY SELECT FALSE, COALESCE(v_count, 0);
  ELSE
    RETURN QUERY SELECT TRUE, v_count;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
